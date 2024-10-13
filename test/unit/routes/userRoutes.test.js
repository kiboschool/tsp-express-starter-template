const request = require('supertest')
const server = require('../../../src/index')
const prisma = require('../../../src/config').dbConfig.client

jest.mock('../../../src/utils/auth')
const auth = require('../../../src/utils/auth')

const author = {
  id: 1,
  name: 'John Doe',
}

const posts = [
  {
    id: 1,
    title: 'Test Title',
    content: 'Test Content',
    authorEmail: 'test@example.com',
    createdAt: new Date('2021-08-01T00:00:00.000Z'),
  },
]

describe('GET /user/:id/posts', () => {
  it('should return all posts for the user if the authenticated user has the correct id', async () => {
    auth.authorize.mockReturnValue(true)
    prisma.user.findUnique = jest.fn().mockResolvedValue(author)
    prisma.post.findMany = jest.fn().mockResolvedValue(posts)
    const response = await request(server).get(`/user/${author.id}/posts`)
    expect(auth.authorize).toHaveBeenCalled()
    expect(prisma.post.findMany).toHaveBeenCalled()
    expect(prisma.user.findUnique).toHaveBeenCalled()
    expect(response.statusCode).toBe(200)
    expect(response.text).toContain(author.name)
    expect(response.text).toContain(posts[0].title)
    expect(response.text).toContain(posts[0].content)
    expect(response.text).toContain(posts[0].createdAt.toDateString())
  })

  it('should return 403 when user is not authorized to view posts for provided id', async () => {
    auth.authorize.mockReturnValue(false)
    const response = await request(server).get(`/user/${author.id}/posts`)

    expect(auth.authorize).toHaveBeenCalled()
    expect(response.statusCode).toBe(403)
  })
})

afterAll(async () => {
  await prisma.$disconnect()
  await server.close()
})
