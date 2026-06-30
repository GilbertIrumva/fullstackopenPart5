// [5.18] Testing-only router. Mounted in app.js when NODE_ENV === 'test'
// so it is impossible to hit this endpoint against the production database.
// Used by the Playwright e2e suite (beforeEach) to wipe state between tests.
const testingRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

testingRouter.post('/reset', async (request, response) => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  response.status(204).end()
})

module.exports = testingRouter
