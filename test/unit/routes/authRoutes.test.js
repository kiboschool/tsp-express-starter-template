const bcrypt = require('bcrypt')
const request = require('supertest')
const server = require('../../../src/index')
const prisma = require('../../../src/config').dbConfig.client

// Login Route
describe('POST /login', () => {
  it('should redirect to user posts page when login is successful', async () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: await bcrypt.hash('secret', 10),
    }
    prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser)

    const res = await request(server).post('/login').send({
      email: 'johndoe@example.com',
      password: 'secret',
    })

    expect(prisma.user.findUnique).toHaveBeenCalled()
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toBe('/user/1/posts')
  })

  it('should return to login page when login is unsuccessful', async () => {
    const res = await request(server).post('/login').send({
      email: 'invalid@example.com',
      password: 'wrongpassword',
    })

    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toBe('/login')
  })
})

// Register Route
describe('POST /register', () => {
  it('should return to register page when email already exists', async () => {
    const existingUser = {
      id: 1,
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'secret',
    }
    prisma.user.findUnique = jest.fn().mockResolvedValue(existingUser)

    const res = await request(server).post('/register').send({
      name: 'Jane Doe',
      email: 'johndoe@example.com',
      password: 'secret',
    })
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toBe('/register')
  })

  it('should create a new user and redirect to login page when registration is successful', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue(null)
    prisma.user.create = jest.fn().mockResolvedValue({
      id: 2,
      name: 'Jane Doe',
      email: 'janedoe@example.com',
    })

    const res = await request(server).post('/register').send({
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      password: 'secret',
    })

    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toBe('/login')
  })
})

afterAll(async () => {
  await prisma.$disconnect()
  await server.close()
})
