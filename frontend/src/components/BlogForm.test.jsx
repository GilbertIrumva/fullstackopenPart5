// [5.16] Test the new-blog form in isolation. The form owns the input
// state; submitting calls the `createBlog` prop with { title, author, url }.
// We assert the prop was called exactly once with the values the user
// typed. Inputs are located by their placeholder text (added in 5.16).
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import BlogForm from './BlogForm'

describe('<BlogForm />', () => {
  test('calls createBlog with the typed values on submit', async () => {
    const createBlog = vi.fn()
    const user = userEvent.setup()

    render(<BlogForm createBlog={createBlog} />)

    const titleInput = screen.getByPlaceholderText('blog title')
    const authorInput = screen.getByPlaceholderText('blog author')
    const urlInput = screen.getByPlaceholderText('blog url')
    const submitButton = screen.getByRole('button', { name: 'create' })

    await user.type(titleInput, 'Testing forms with RTL')
    await user.type(authorInput, 'Jane Doe')
    await user.type(urlInput, 'https://example.com/forms')
    await user.click(submitButton)

    expect(createBlog).toHaveBeenCalledTimes(1)
    expect(createBlog).toHaveBeenCalledWith({
      title: 'Testing forms with RTL',
      author: 'Jane Doe',
      url: 'https://example.com/forms',
    })
  })
})
