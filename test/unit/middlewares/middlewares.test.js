const {
  sessionMessageMiddleware,
} = require('../../../src/middlewares/middlewares')

describe('sessionMessageMiddleware', () => {
  const setup = (sessionData) => {
    const req = { session: { ...sessionData } }
    const res = { locals: {} }
    const next = jest.fn()

    sessionMessageMiddleware(req, res, next)

    return { req, res, next }
  }

  it('sets error message correctly', () => {
    const { res, next } = setup({ error: 'Error occurred' })
    expect(res.locals.message).toContain('Error occurred')
    expect(next).toHaveBeenCalled()
  })

  it('sets success message correctly', () => {
    const { res, next } = setup({ success: 'Success!' })
    expect(res.locals.message).toContain('Success!')
    expect(next).toHaveBeenCalled()
  })

  it('handles when there are no messages', () => {
    const { res, next } = setup({})
    expect(res.locals.message).toBe('')
    expect(next).toHaveBeenCalled()
  })
})
 