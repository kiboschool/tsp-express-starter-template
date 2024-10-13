const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { authenticate, registerUser } = require('../utils/auth')
const { authConfig, dbConfig } = require('../config')

const prisma = dbConfig.client

router.get('/login', async (req, res) => {
  res.render('login', { showLogout: false })
})

router.post('/login', async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password)
  if (user) {
    req.session.regenerate(function () {
      req.session.success =
        'Authenticated as ' +
        user.name +
        ' click to <a href="/logout">logout</a>. '
      const token = jwt.sign({ user: { id: user.id } }, authConfig.secretKey, {
        expiresIn: '1h',
      })
      res
        .cookie('access_token', token, {
          httpOnly: true,
          maxAge: 60 * 60 * 1000,
        })
        .redirect('/user/' + user.id + '/posts')
    })
  } else {
    req.session.error =
      'Authentication failed, please check your email and password.'
    res.redirect('/login')
  }
})

router.get('/logout', function (req, res) {
  req.session.destroy(function () {
    res.clearCookie('access_token').redirect('/')
  })
})

router.get('/register', async (req, res) => {
  res.render('register', { showLogout: false })
})

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  })

  if (existingUser) {
    req.session.error = 'Registration failed, email already exists.'
    res.redirect('/register')
  } else {
    registerUser(name, email, password)
    req.session.error = 'Registration Successful, please login.'
    res.redirect('/login')
  }
})

module.exports = router
