import { test, expect } from '@playwright/test'

test.beforeEach(async ({ request }) => {
  await request.post('http://localhost:3003/api/testing/reset')
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

const login = async (page, username) => {
  await page.getByRole('textbox').first().fill(username)
  await page.locator('input[type="password"]').fill('salainen')
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, title, author) => {
  await page.getByRole('button', { name: 'create new blog' }).click()
  await page.getByPlaceholder('blog title').fill(title)
  await page.getByPlaceholder('blog author').fill(author)
  await page.getByPlaceholder('blog url').fill(`https://example.com/${title.toLowerCase().replace(/\s+/g, '-')}`)

  await page.getByRole('button', { name: 'create' }).click()

  await expect(page.locator('.blog').filter({ hasText: title }).first()).toBeVisible({ timeout: 10000 })
}

test('a blog can be liked', async ({ page, request }) => {
  const user = await createUser(request)

  await page.goto('/')

  await login(page, user.username)

  await page.getByRole('button', { name: 'create new blog' }).click()

  await page.getByPlaceholder('blog title').fill('Likeable post')
  await page.getByPlaceholder('blog author').fill('Like Tester')
  await page.getByPlaceholder('blog url').fill('https://example.com/like')

  await Promise.all([
    page.waitForResponse((resp) => resp.url().includes('/api/blogs') && resp.request().method() === 'POST'),
    page.getByRole('button', { name: 'create' }).click(),
  ])

  await page.locator('.blog', { hasText: 'Likeable post' }).first().getByRole('button', { name: 'view' }).click()
  await Promise.all([
    page.waitForResponse((resp) => resp.url().includes('/api/blogs') && resp.request().method() === 'PUT'),
    page.locator('.blog', { hasText: 'Likeable post' }).first().getByRole('button', { name: 'like' }).click(),
  ])

  await expect(
    page.locator('.blog', { hasText: 'Likeable post' }).getByText(/likes\s+1/)
  ).toBeVisible({ timeout: 10000 })
})

test('blogs are ordered by the number of likes', async ({ page, request }) => {
  const user = await createUser(request)

  await page.goto('/')
  await login(page, user.username)

  await createBlog(page, 'Least liked blog', 'Ordering Tester')
  await createBlog(page, 'Most liked blog', 'Ordering Tester')
  await createBlog(page, 'Middle liked blog', 'Ordering Tester')

  const likeBlog = async (title) => {
    const blogRow = page.locator('.blog').filter({ hasText: title }).first()
    await expect(blogRow).toBeVisible()

    const toggleButton = blogRow.getByRole('button', { name: /view|hide/i })
    await expect(toggleButton).toBeVisible()

    const likeButton = blogRow.getByRole('button', { name: 'like' })
    const isLikeVisible = await likeButton.isVisible().catch(() => false)

    if (!isLikeVisible) {
      await toggleButton.click({ force: true })
    }

    await expect(likeButton).toBeVisible()
    await likeButton.click({ force: true })
  }

  await likeBlog('Most liked blog')
  await likeBlog('Most liked blog')
  await likeBlog('Middle liked blog')

  await expect(page.locator('.blog').first()).toBeVisible({ timeout: 10000 })
  await expect(page.locator('.blog').first()).toContainText('Most liked blog', { timeout: 10000 })
  await expect(page.locator('.blog').nth(1)).toContainText('Middle liked blog', { timeout: 10000 })
  await expect(page.locator('.blog').nth(2)).toContainText('Least liked blog', { timeout: 10000 })
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
    page.locator('.blog').filter({ hasText: title }).first()
  ).toHaveCount(0, { timeout: 10000 })
})

test('only the user who added a blog sees its delete button', async ({ page, request }) => {
  const creator = await createUser(request)
  const otherUser = await createUser(request)

  await page.goto('/')
  await login(page, creator.username)

  await page.getByRole('button', { name: 'create new blog' }).click()

  const title = `Blog not deletable by others ${Date.now()}`

  await page.getByPlaceholder('blog title').fill(title)
  await page.getByPlaceholder('blog author').fill('Delete Visibility Tester')
  await page.getByPlaceholder('blog url').fill('https://example.com/visibility')

  await page.getByRole('button', { name: 'create' }).click()
  await page.getByRole('button', { name: 'logout' }).click()

  await login(page, otherUser.username)

  const blogRow = page.locator('.blog').filter({
    hasText: title,
  }).first()

  await blogRow.getByRole('button', { name: 'view' }).click()

  await expect(blogRow.getByRole('button', { name: 'remove' })).toHaveCount(0)
})