const express = require('express')
const router = express.Router()
const { authorize } = require('../utils/auth')
const { dbConfig } = require('../config')

const prisma = dbConfig.client

router.get('/:id/posts', async (req, res) => {
  const id = req.params.id
  if (authorize(id, req.cookies.access_token)) {
    const author = await prisma.user.findUnique({
      where: { id: Number(id) },
    })
    delete author.password
    const posts = await prisma.post.findMany({
      where: {
        authorId: Number(id),
      },
    })

    res.render('posts', { showLogout: true, author, posts })
  } else {
    res.sendStatus(403)
  }
})

module.exports = router
