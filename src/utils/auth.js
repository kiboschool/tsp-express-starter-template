const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { authConfig, dbConfig } = require('../config')

async function authenticate(email, password) {
  const user = await dbConfig.client.user.findUnique({
    where: { email: email },
  })
  if (!user) {
    return null
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return null
  }
  return user
}

async function registerUser(name, email, password) {
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  const user = await dbConfig.client.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })
  return user
}

// Checks that the user is logged in and has the correct id for the action they
// are trying to perform.
function authorize(id, token) {
  if (!token) {
    return null
  }
  try {
    const data = jwt.verify(token, authConfig.secretKey)

    if (id != data.user.id) {
      return false
    }
    return true
  } catch (error) {
    return false
  }
}

// Export authentication functions
module.exports = { authenticate, registerUser, authorize }
