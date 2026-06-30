// [5.17] First e2e test: load the app and verify the login form is the
// default landing view.
// [5.18] beforeEach now resets the backend test DB (POST /api/testing/reset)
// and creates a fresh user (POST /api/users) so every test starts from
// the same known state. Added Login describe block with success + failure
// cases.
//
// Prerequisites for running this suite:
//   1. backend running in test mode:    cd server && npm run start:test
//   2. frontend dev server running:     cd frontend && npm run dev
//   3. server/.env must define TEST_MONGODB_URI pointing to a *separate*
//      database (e.g. .../bloglist-test) — the reset endpoint wipes it.
const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // empty the test database
    await request.post('http://localhost:3003/api/testing/reset')

    // seed one user we can log in with
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen',
      },
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Log in to application' }),
    ).toBeVisible()
    await expect(page.getByRole('textbox').first()).toBeVisible() // username
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByRole('textbox').first().fill('mluukkai')
      await page.locator('input[type="password"]').fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()

      // logged-in greeting and the new-blog toggle button should appear
      await expect(
        page.getByText('Matti Luukkainen logged in'),
      ).toBeVisible()
      await expect(
        page.getByRole('button', { name: 'create new blog' }),
      ).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByRole('textbox').first().fill('mluukkai')
      await page.locator('input[type="password"]').fill('wrong')
      await page.getByRole('button', { name: 'login' }).click()

      // the App's notify() helper renders "wrong username or password"
      // for a failed login.
      const errorBanner = page.getByText('wrong username or password')
      await expect(errorBanner).toBeVisible()

      // and we must still be on the login screen (no greeting)
      await expect(
        page.getByText('Matti Luukkainen logged in'),
      ).not.toBeVisible()
    })
  })
})
