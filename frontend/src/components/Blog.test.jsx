// [5.13] First test for the Blog component. Renders a blog and asserts:
//   1. title and author are shown by default
//   2. url and likes are NOT shown until the user clicks "view"
//
// We don't need to mock blogService here — Blog never calls it. It only
// invokes the `updateBlog` / `removeBlog` props (no-ops in this test).
import { render, screen } from '@testing-library/react'
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
})
