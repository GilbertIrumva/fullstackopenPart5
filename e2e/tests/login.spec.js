// [5.17] First e2e test: load the app and verify the login form is the
// default landing view. Body skeleton follows the FSO 5.17 template.
const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    // heading from the not-logged-in branch of App.jsx
    await expect(
      page.getByRole('heading', { name: 'Log in to application' }),
    ).toBeVisible()

    // both fields and the submit button must be visible
    await expect(page.getByRole('textbox').first()).toBeVisible() // username
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })
})
