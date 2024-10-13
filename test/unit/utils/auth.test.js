const {
  authenticate,
  authorize,
  registerUser,
} = require('../../../src/utils/auth')

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  genSalt: jest.fn(),
  hash: jest.fn(),
}))
const bcrypt = require('bcrypt')

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}))
const jwt = require('jsonwebtoken')

jest.mock('../../../src/config', () => ({
  dbConfig: {
    client: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    },
  },
  authConfig: {
    secretKey: 'test-secret',
  },
}))
const { dbConfig } = require('../../../src/config')

describe('authenticate', () => {
  it('returns null if user not found', async () => {
    dbConfig.client.user.findUnique.mockResolvedValue(null)
    const user = await authenticate('test@example.com', 'password')
    expect(user).toBeNull()
  })

  it('returns null if password does not match', async () => {
    dbConfig.client.user.findUnique.mockResolvedValue({
      email: 'test@example.com',
      password: 'hashedpassword',
    })
    bcrypt.compare.mockResolvedValue(false)
    const user = await authenticate('test@example.com', 'wrongpassword')
    expect(user).toBeNull()
  })

  it('returns user if password matches', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedpassword',
    }
    dbConfig.client.user.findUnique.mockResolvedValue(mockUser)
    bcrypt.compare.mockResolvedValue(true)
    const user = await authenticate('test@example.com', 'password')
    expect(user).toEqual(mockUser)
  })
})

describe('registerUser', () => {
  it('creates a new user with hashed password', async () => {
    bcrypt.genSalt.mockResolvedValue('salt')
    bcrypt.hash.mockResolvedValue('hashedpassword')
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
    }
    dbConfig.client.user.create.mockResolvedValue(mockUser)

    const user = await registerUser('John Doe', 'john@example.com', 'password')
    expect(user).toEqual(mockUser)
    expect(bcrypt.hash).toHaveBeenCalledWith('password', 'salt')
  })
})

describe('authorize', () => {
  it('returns null if no token provided', () => {
    const result = authorize(1, null)
    expect(result).toBeNull()
  })

  it('returns false if token verification fails', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error()
    })
    const result = authorize(1, 'invalidtoken')
    expect(result).toBe(false)
  })

  it('returns false if user id does not match', () => {
    jwt.verify.mockReturnValue({ user: { id: 2 } })
    const result = authorize(1, 'validtoken')
    expect(result).toBe(false)
  })

  it('returns true if user id matches whats in the token', () => {
    jwt.verify.mockReturnValue({ user: { id: 1 } })
    const result = authorize(1, 'validtoken')
    expect(result).toBe(true)
  })
})
