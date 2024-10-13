const express = require('express')
const router = express.Router()
const { authorize } = require('../utils/auth')
const { dbConfig } = require('../config')

const prisma = dbConfig.client

router.post('/', async (req, res) => {
  const { title, content, authorEmail, authorId } = req.body
  if (!title || !content || !authorEmail || !authorId) {
    res.sendStatus(400)
  } else if (authorize(authorId, req.cookies?.access_token)) {
    await prisma.post.create({
      data: {
        title,
        content,
        author: { connect: { email: authorEmail } },
      },
    })
    res.redirect('/user/' + authorId + '/posts')
  } else {
    res.sendStatus(403)
  }
})

module.exports = router
