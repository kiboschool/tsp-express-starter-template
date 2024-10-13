const express = require('express')
const authRoutes = require('./routes/authRoutes')
const postRoutes = require('./routes/postRoutes')
const userRoutes = require('./routes/userRoutes')
const { serverConfig } = require('./config')
const { setupMiddlewares } = require('./middlewares/middlewares')

const path = require('path')

const app = express()
setupMiddlewares(app)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Define routes
app.get('/', async (req, res) => {
  res.redirect('/login')
})

app.use('/', authRoutes)
app.use('/user', userRoutes)
app.use('/post', postRoutes)

const server = app.listen(serverConfig.port, () =>
  console.log(`🚀 Server ready at: http://localhost:${serverConfig.port}`)
)

module.exports = server
