const request = require('supertest')
const server = require('../../../src/index')
const prisma = require('../../../src/config').dbConfig.client

jest.mock('../../../src/utils/auth')
const auth = require('../../../src/utils/auth')

const data = {
  authorId: 1,
  title: 'Test Title',
  content: 'Test Content',
  authorEmail: 'test@example.com',
}

describe('POST /post', () => {
  it('should create new post and then redirect to user posts page when post data is valid', async () => {
    auth.authorize.mockReturnValue(true)
    prisma.post.create = jest.fn().mockResolvedValue({ id: 1 })
    const response = await request(server).post('/post').send(data)

    expect(auth.authorize).toHaveBeenCalled()
    expect(prisma.post.create).toHaveBeenCalled()
    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toBe('/user/1/posts')
  })

  it('should return 403 when user is not authorized to post', async () => {
    auth.authorize.mockReturnValue(false)
    const response = await request(server).post('/post').send(data)

    expect(auth.authorize).toHaveBeenCalled()
    expect(response.statusCode).toBe(403)
  })

  it('should fail adding new post and redirect to user posts page when post data is invalid', async () => {
    auth.authorize.mockReturnValue(true)
    prisma.post.create = jest.fn().mockResolvedValue({ id: 1 })
    const response = await request(server)
      .post('/post')
      .send({ title: 'Test Title', authorEmail: 'test@example.com' })

    expect(response.statusCode).toBe(400)
  })
})

afterAll(async () => {
  await prisma.$disconnect()
  await server.close()
})
