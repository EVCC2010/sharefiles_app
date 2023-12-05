const express = require('express')
const multer = require('multer')
const cors = require('cors')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const fs = require('fs')
const path = require('path')
const { body, validationResult } = require('express-validator')
const mime = require('mime-types')
require('dotenv').config()

const app = express()
const port = 4000

// Middleware setup
app.use(bodyParser.json())
app.use(cors())
app.use(helmet())

function ensureUploadDirectory() {
  const uploadDir = path.join(__dirname, 'uploads') // Path to your upload directory

  // Check if the directory exists
  if (!fs.existsSync(uploadDir)) {
    // Create the directory if it doesn't exist
    fs.mkdirSync(uploadDir, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating upload directory:', err)
      } else {
        console.log('Upload directory created')
      }
    })
  } else {
    console.log('Upload directory already exists')
  }
}
ensureUploadDirectory()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Ensure the correct directory is specified here
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, //10MB
  },
  fileFilter: function (req, file, cb) {
    // Check the file's MIME type from Multer's file object
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    const fileMimeType = mime.lookup(file.originalname) // Get MIME type using 'mime-types'

    if (allowedTypes.includes(fileMimeType)) {
      cb(null, true)
    } else {
      // Reject a file that doesn't match the allowed types
      cb(
        new Error(
          'Invalid file type. Only JPEG, PNG, and PDF files are allowed'
        )
      )
    }
  },
})

// MySQL connection setup
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

// Connect to MySQL
db.connect((err) => {
  if (err) {
    throw err
  }
  console.log('Connected to MySQL database')
})

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 100, // limited to 100 requests
  message: 'Too many requests from this IP, please try again later',
})

app.use('/signup', limiter) // Apply rate limiter to signup endopoint

const signupValidation = [
  body('first_name').notEmpty().withMessage('First Name is required'),
  body('last_name').notEmpty().withMessage('Last Name is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('date_of_birth').notEmpty().withMessage('Date of Birth is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage(
      'Password must contain at least one uppercase letter and one special character'
    ),
]

app.post('/signup', signupValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { first_name, last_name, email, date_of_birth, password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = {
      first_name,
      last_name,
      email,
      date_of_birth,
      password: hashedPassword,
      approved: false,
    }

    db.query('INSERT INTO users SET ?', newUser, (error, dbRes) => {
      if (error) {
        res.status(500).json({ error: error.message })
      } else {
        res.status(201).json({ message: 'User registered successfully' })
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ message: 'Internal error' })
  }
})

const jwtSecret = process.env.JWT_SECRET

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    if (email && password) {
      db.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        async (err, results) => {
          if (err) {
            res.status(500).json({ error: err.message })
          } else {
            if (results.length > 0) {
              const user = results[0]
              // Compare the provided password with the hashed password from the database
              const match = await bcrypt.compare(password, user.password)

              if (match && user.approved) {
                // Create JWT payload
                const payload = {
                  userId: user.id,
                  email: user.email,
                  // Add any other relevant user data to the payload
                }

                // Sign the token with a secret key and set an expiration time
                const token = jwt.sign(payload, jwtSecret, {
                  expiresIn: '1h',
                })

                // Send the token as a response upon successful login
                res.status(200).json({ token, redirect: '/dashboard' })
              } else {
                res.status(401).json({ message: 'Invalid credentials' })
              }
            } else {
              res.status(401).json({ message: 'Invalid credentials' })
            }
          }
        }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal error' })
  }
})

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { filename, originalname } = req.file

    // Check if the authorization header exists
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Retrieve the JWT token from the request header
    const token = req.headers.authorization.split(' ')[1]

    // Decode the token to extract user information (in this case, the user ID)
    const decodedToken = jwt.verify(token, jwtSecret)
    const userId = decodedToken.userId // Extract the user ID from the decoded token

    // Execute the query to insert file metadata
    db.query(
      'INSERT INTO files (original_filename, renamed_filename, path, uploaded_by) VALUES (?, ?, ?, ?)',
      [originalname, filename, 'uploads/' + filename, userId],
      (error, result) => {
        if (error) {
          console.error('Error saving file metadata:', error)
          // Remove the uploaded file if there's an error in saving metadata
          fs.unlinkSync(req.file.path)
          return res.status(500).json({ error: 'Error saving file metadata' })
        }
        res.status(200).json({
          message: 'File uploaded successfully',
          fileId: result.insertId,
        })
      }
    )
  } catch (error) {
    console.error('Error:', error)
    // Remove the uploaded file if there's an unexpected error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path)
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
