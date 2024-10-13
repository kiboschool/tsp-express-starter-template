require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = {
  serverConfig: {
    port: process.env.PORT || 3000,
  },
  dbConfig: {
    client: prisma,
  },
  authConfig: {
    secretKey: process.env.SECRET_KEY || 'secret-key',
  },
  // Other configurations
}
