const cookieParser = require('cookie-parser')
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const path = require('path')
const { authConfig } = require('../config')

function setupMiddlewares(app) {
  app.use(cookieParser())
  app.use(express.static(path.join(__dirname, '../public')))
  app.use(express.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: authConfig.secretKey,
    })
  )
  app.use(sessionMessageMiddleware)
}

function sessionMessageMiddleware(req, res, next) {
  const err = req.session.error
  const msg = req.session.success
  delete req.session.error
  delete req.session.success
  res.locals.message = ''
  if (err)
    res.locals.message =
      '<div class="alert alert-warning" role="alert">' + err + '</div>'
  if (msg)
    res.locals.message =
      '<div class="alert alert-success" role="alert">' + msg + '</div>'
  next()
}

module.exports = { setupMiddlewares, sessionMessageMiddleware }
