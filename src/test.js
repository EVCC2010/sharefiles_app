// Require the bcrypt package
const bcrypt = require('bcrypt')

// Define your password
const password = 'Y123456!'

// Generate the bcrypt hash
bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error(err)
    return
  }
  console.log('Generated bcrypt hash:', hash)
})
