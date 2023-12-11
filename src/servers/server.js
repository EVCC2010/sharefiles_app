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
  const uploadDir = path.join(__dirname, '../uploads')
  if (!fs.existsSync(uploadDir)) {
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

//Settings for local storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, //10MB
  },
  fileFilter: function (req, file, cb) {
    // Check the file's MIME type from Multer's file object
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    const fileMimeType = mime.lookup(file.originalname)
    if (allowedTypes.includes(fileMimeType)) {
      cb(null, true)
    } else {
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

//Rate Limiter setup
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

//Endpoint to signup a new user
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
      role: 'user', //Fixed to 'user' as a string
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
              const match = await bcrypt.compare(password, user.password)

              if (match && user.approved) {
                const payload = {
                  userId: user.id,
                  email: user.email,
                  role: user.role,
                }

                const token = jwt.sign(payload, jwtSecret, {
                  expiresIn: '1h',
                })

                // Set the token in an HTTP-only secure cookie
                res.cookie('token', token, {
                  httpOnly: true,
                  secure: true,
                  sameSite: 'strict',
                })
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

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { filename, originalname } = req.file
    const fileSize = req.file.size

    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = req.headers.authorization.split(' ')[1]

    const decodedToken = jwt.verify(token, jwtSecret)
    const userId = decodedToken.userId

    db.query(
      'INSERT INTO files (original_filename, renamed_filename, path, uploaded_by,size,shared) VALUES (?,?,?,?,?,?)',
      [originalname, filename, 'uploads/' + filename, userId, fileSize, true],
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

app.get('/dashboard/summary', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]

    const decodedToken = jwt.verify(token, jwtSecret)
    const userId = decodedToken.userId

    const summaryQuery = `
      SELECT 
        COUNT(*) AS uploadedFiles, 
        SUM(size) AS storageUsed,
        SUM(IF(shared = true, 1, 0)) AS sharedFiles
        /* You might need to adjust this query based on your database schema */
        /* Add more queries as needed to get the required summary data */

      FROM files
      WHERE uploaded_by = ?
      /* Add conditions if necessary */
    `
    db.query(summaryQuery, [userId], (error, results) => {
      if (error) {
        console.error('Error fetching summary data:', error)
        res.status(500).json({ error: 'Error fetching summary data' })
      } else {
        const summaryData = {
          uploadedFiles: results[0].uploadedFiles || 0,
          storageUsed: results[0].storageUsed || 0,
          sharedFiles: results[0].sharedFiles || 0,
        }
        res.status(200).json(summaryData)
      }
    })
  } catch (error) {
    console.error('Error fetching summary data:', error)
    res.status(500).json({ error: 'Error fetching summary data' })
  }
})

// Manage Files Endpoints
// Endpoint to fetch user information (userId and isAdmin)
app.get('/userinfo', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, jwtSecret)
    const userId = decodedToken.userId
    const role = decodedToken.role
    // Logic to determine admin status based on the role or any other condition
    const isAdmin = role === 'admin'

    res.status(200).json({ userId, isAdmin })
  } catch (error) {
    console.error('Error fetching user info:', error)
    res.status(500).json({ error: 'Error fetching user info' })
  }
})

// Endpoint to fetch files owned by a specific user and shared with a specific user
app.get('/files/:userId', async (req, res) => {
  const userId = req.params.userId
  const shared = req.query.shared === 'true' // Check if the shared query parameter is true

  try {
    let filesQuery = `
      SELECT * FROM files
      WHERE uploaded_by = ?
    `

    if (shared) {
      filesQuery = `
        SELECT * FROM files
        WHERE uploaded_by = ? OR (shared = true AND uploaded_by != ?)
      `
    }

    db.query(filesQuery, [userId, userId], (error, results) => {
      if (error) {
        console.error('Error fetching user files:', error)
        res.status(500).json({ error: 'Error fetching user files' })
      } else {
        res.status(200).json(results)
      }
    })
  } catch (error) {
    console.error('Error fetching user files:', error)
    res.status(500).json({ error: 'Error fetching user files' })
  }
})

// Endpoint to toggle shared status of a file (for admin or file owner)
app.put('/files/toggleShare/:fileId', async (req, res) => {
  const fileId = req.params.fileId
  const { shared } = req.body

  try {
    const updateShareQuery = `
      UPDATE files 
      SET shared = ?
      WHERE id = ?
    `
    db.query(updateShareQuery, [shared, fileId], (error, result) => {
      if (error) {
        console.error('Error updating shared status:', error)
        res.status(500).json({ error: 'Error updating shared status' })
      } else {
        res.status(200).json({ message: 'Shared status updated successfully' })
      }
    })
  } catch (error) {
    console.error('Error updating shared status:', error)
    res.status(500).json({ error: 'Error updating shared status' })
  }
})

// Endpoint to download a file by fileId
app.get('/download/:fileId', async (req, res) => {
  const fileId = req.params.fileId
  try {
    db.query('SELECT * FROM files WHERE id = ?', [fileId], (error, results) => {
      if (error) {
        console.error('Error fetching file details:', error)
        res.status(500).json({ error: 'Error fetching file details' })
      } else {
        const fileDetails = results[0]
        const filePath = fileDetails.path

        // Send the file as a download attachment
        res.download(filePath, fileDetails.original_filename, (err) => {
          if (err) {
            console.error('Error downloading file:', err)
            res.status(500).json({ error: 'Error downloading file' })
          }
        })
      }
    })
  } catch (error) {
    console.error('Error downloading file:', error)
    res.status(500).json({ error: 'Error downloading file' })
  }
})

// Endpoint to delete a file by fileId
app.delete('/files/:fileId', async (req, res) => {
  const fileId = req.params.fileId
  try {
    db.query('DELETE FROM files WHERE id = ?', [fileId], (error, result) => {
      if (error) {
        console.error('Error deleting file:', error)
        res.status(500).json({ error: 'Error deleting file' })
      } else {
        res.status(200).json({ message: 'File deleted successfully' })
      }
    })
  } catch (error) {
    console.error('Error deleting file:', error)
    res.status(500).json({ error: 'Error deleting file' })
  }
})

// Endpoint to toggle shared status of a file by fileId
app.put('/files/toggleShare/:fileId', async (req, res) => {
  const fileId = req.params.fileId
  const { shared } = req.body

  try {
    const updateShareQuery = `
      UPDATE files 
      SET shared = ?
      WHERE id = ?
    `
    db.query(updateShareQuery, [shared, fileId], (error, result) => {
      if (error) {
        console.error('Error updating shared status:', error)
        res.status(500).json({ error: 'Error updating shared status' })
      } else {
        res.status(200).json({ message: 'Shared status updated successfully' })
      }
    })
  } catch (error) {
    console.error('Error updating shared status:', error)
    res.status(500).json({ error: 'Error updating shared status' })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
