//
// We don't need to mock blogService here — Blog never calls it. It only
// invokes the `updateBlog` / `removeBlog` props (no-ops in this test).
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import Blog from './Blog'

describe('<Blog />', () => {
  const blog = {
    id: 'abc123',
    title: 'Component testing is done with react-testing-library',
    author: 'Kent C. Dodds',
    url: 'https://example.com/rtl',
    likes: 7,
    user: { id: 'u1', username: 'tester', name: 'Test User' },
  }

  test('renders title and author, but not url or likes by default', () => {
    const { container } = render(
      <Blog
        blog={blog}
        updateBlog={() => {}}
        removeBlog={() => {}}
        currentUsername="tester"
      />,
    )

    // title and author appear in the always-visible header
    const header = container.querySelector('.blog-header')
    expect(header).toHaveTextContent(
      'Component testing is done with react-testing-library',
    )
    expect(header).toHaveTextContent('Kent C. Dodds')

    // the collapsible details block must not be in the DOM yet
    expect(container.querySelector('.blog-details')).toBeNull()

    // and the url / likes text should not be findable anywhere
    expect(screen.queryByText('https://example.com/rtl')).toBeNull()
    expect(screen.queryByText(/likes 7/)).toBeNull()
  })

  test('shows url and likes after the view button is clicked', async () => {
    const { container } = render(
      <Blog
        blog={blog}
        updateBlog={() => {}}
        removeBlog={() => {}}
        currentUsername="tester"
      />,
    )

    const user = userEvent.setup()
    const viewButton = screen.getByRole('button', { name: 'view' })
    await user.click(viewButton)

    // details block is now mounted
    const details = container.querySelector('.blog-details')
    expect(details).not.toBeNull()

    // url and likes are visible inside it
    expect(details).toHaveTextContent('https://example.com/rtl')
    expect(details).toHaveTextContent('likes 7')

    // and the toggle button flipped to "hide"
    expect(screen.getByRole('button', { name: 'hide' })).toBeInTheDocument()
  })

  test('calls the updateBlog prop once per like-button click', async () => {
    const updateBlog = vi.fn()

    render(
      <Blog
        blog={blog}
        updateBlog={updateBlog}
        removeBlog={() => {}}
        currentUsername="tester"
      />,
    )

    const user = userEvent.setup()

    // the like button only exists after the details are expanded
    await user.click(screen.getByRole('button', { name: 'view' }))

    const likeButton = screen.getByRole('button', { name: 'like' })
    await user.click(likeButton)
    await user.click(likeButton)

    expect(updateBlog).toHaveBeenCalledTimes(2)
  })
})
