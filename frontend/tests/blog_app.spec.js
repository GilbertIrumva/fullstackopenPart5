import { test, expect } from '@playwright/test'

const createUser = async (request) => {
  const username = `mluukkai${Date.now()}`
  const user = {
    username,
    name: 'Matti Luukkainen',
    password: 'salainen',
  }

  await request.post('http://localhost:3003/api/users', {
    data: user,
  })

  return user
}

const login = async (page, username) => {
  await page.getByRole('textbox').first().fill(username)
  await page.locator('input[type="password"]').fill('salainen')
  await page.getByRole('button', { name: 'login' }).click()
}

test('a blog can be liked', async ({ page, request }) => {
  const user = await createUser(request)

  await page.goto('/')

  await login(page, user.username)

  await page.getByRole('button', { name: 'create new blog' }).click()

  await page.getByPlaceholder('blog title').fill('Likeable post')
  await page.getByPlaceholder('blog author').fill('Like Tester')
  await page.getByPlaceholder('blog url').fill('https://example.com/like')

  await page.getByRole('button', { name: 'create' }).click()

  const blogRow = page.locator('.blog', {
    hasText: 'Likeable post',
  }).last()

  await blogRow.getByRole('button', { name: 'view' }).click()
  await blogRow.getByRole('button', { name: 'like' }).click()

  await expect(blogRow.getByText(/likes\s+1/)).toBeVisible()
})

test('the user who created a blog can delete it', async ({ page, request }) => {
  const user = await createUser(request)

  await page.goto('/')

  await login(page, user.username)

  await page.getByRole('button', { name: 'create new blog' }).click()

  const title = `Blog to delete ${Date.now()}`

  await page.getByPlaceholder('blog title').fill(title)
  await page.getByPlaceholder('blog author').fill('Delete Tester')
  await page.getByPlaceholder('blog url').fill('https://example.com/delete')

  await page.getByRole('button', { name: 'create' }).click()

  const blogRow = page.locator('.blog').filter({
    hasText: title,
  }).first()

  await blogRow.getByRole('button', { name: 'view' }).click()

  page.on('dialog', dialog => dialog.accept())

  await blogRow.getByRole('button', { name: 'remove' }).click()

  await expect(
    page.locator('.blog').filter({ hasText: title })
  ).toHaveCount(0)
})