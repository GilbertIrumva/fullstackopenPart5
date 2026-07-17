import { test, expect } from '@playwright/test'

test.beforeEach(async ({ request }) => {
  await request.post('http://localhost:3003/api/testing/reset')
  // wait a bit for reset to complete
  await new Promise(resolve => setTimeout(resolve, 100))
})

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

const login = async (page, username, password = 'salainen') => {
  await page.getByRole('textbox', { name: /username/i }).fill(username)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, title, author, url = `https://example.com/${title.toLowerCase().replace(/\s+/g, '-')}`) => {
  await page.getByRole('link', { name: 'create new' }).click()
  await page.getByPlaceholder('blog title').fill(title)
  await page.getByPlaceholder('blog author').fill(author)
  await page.getByPlaceholder('blog url').fill(url)
  await page.getByRole('button', { name: 'create' }).click()
  // wait for the blog to appear in the list
  await page.getByRole('link', { name: new RegExp(`${title}.*${author}`, 'i') }).waitFor({ timeout: 5000 })
}

test('login succeeds with the correct username/password combination', async ({ page, request }) => {
  const user = await createUser(request)

  await page.goto('/login')
  await login(page, user.username)

  await expect(page.getByText(`${user.name} logged in`)).toBeVisible()
})

test('login fails with an incorrect username/password combination', async ({ page, request }) => {
  await createUser(request)

  await page.goto('/login')
  await login(page, 'wrong-user', 'wrong-password')

  await expect(page.getByText(/wrong username or password/i)).toBeVisible()
  await expect(page.getByRole('button', { name: 'logout' })).toHaveCount(0)
})

test('a logged-in user can create a blog', async ({ page, request }) => {
  const user = await createUser(request)

  await page.goto('/login')
  await login(page, user.username)

  const title = `Created by Playwright ${Date.now()}`
  await createBlog(page, title, 'Playwright Tester')

  await expect(page.getByText(`${title} by Playwright Tester`)).toBeVisible()
})

test('a logged-in user can like blogs', async ({ page, request }) => {
  const user = await createUser(request)

  await page.goto('/login')
  await login(page, user.username)

  const title = `Likeable post ${Date.now()}`
  await createBlog(page, title, 'Like Tester')
  await page.getByRole('link', { name: new RegExp(title, 'i') }).click()
  await page.getByRole('button', { name: 'like' }).click()

  await expect(page.getByText(/likes 1/i)).toBeVisible()
})

test('a logged-in user can delete a blog', async ({ page, request }) => {
  const user = await createUser(request)

  await page.goto('/login')
  await login(page, user.username)

  const title = `Deletable blog ${Date.now()}`
  await createBlog(page, title, 'Delete Tester')
  await page.getByRole('link', { name: new RegExp(title, 'i') }).click()

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'remove' }).click()

  // wait for navigation back to home page
  await page.waitForURL('http://localhost:5173/', { timeout: 5000 })
  
  // now check that the blog is gone from the list
  await expect(page.getByText(title)).toHaveCount(0)
})

test('blogs are sorted by likes', async ({ page, request }) => {
  const user = await createUser(request)

  await page.goto('/login')
  await login(page, user.username)
  // wait for the page to load the blogs
  await page.waitForLoadState('networkidle')

  const firstTitle = `Least liked ${Date.now()}`
  const secondTitle = `Middle liked ${Date.now()}`
  const thirdTitle = `Most liked ${Date.now()}`

  await createBlog(page, firstTitle, 'Ordering Tester')
  await createBlog(page, secondTitle, 'Ordering Tester')
  await createBlog(page, thirdTitle, 'Ordering Tester')

  for (const title of [thirdTitle, thirdTitle, secondTitle]) {
    await page.getByRole('link', { name: new RegExp(title, 'i') }).click()
    await page.getByRole('button', { name: 'like' }).click()
    await page.getByRole('link', { name: 'blogs' }).click()
  }

  const blogEntries = page.locator('.blog')
  await expect(blogEntries.nth(0)).toContainText(thirdTitle)
  await expect(blogEntries.nth(1)).toContainText(secondTitle)
  await expect(blogEntries.nth(2)).toContainText(firstTitle)
})