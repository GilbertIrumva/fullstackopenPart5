import { test, expect } from '@playwright/test'

test('a blog can be liked', async ({ page }) => {
await page.goto('http://localhost:5173')

// login
await page.getByRole('textbox').first().fill('mluukkai')
await page.locator('input[type="password"]').fill('salainen')
await page.getByRole('button', { name: 'login' }).click()

// create blog
await page.getByRole('button', { name: 'create new blog' }).click()

await page.getByPlaceholder('blog title').fill('Likeable post')
await page.getByPlaceholder('blog author').fill('Like Tester')
await page.getByPlaceholder('blog url').fill('https://example.com/like')

await page.getByRole('button', { name: 'create' }).click()

// open blog details
const blogRow = page.locator('.blog', {
hasText: 'Likeable post',
}).last()

await blogRow.getByRole('button', { name: 'view' }).click()

// like the blog
await blogRow.getByRole('button', { name: 'like' }).click()

// verify likes increased
await expect(blogRow.getByText(/likes\s+1/)).toBeVisible()
})
