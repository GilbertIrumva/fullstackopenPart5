import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import axios from 'axios'

vi.mock('axios')

describe('App routing', () => {
  beforeEach(() => {
    window.localStorage.clear()
    axios.interceptors.response.use.mockImplementation(() => 0)
    axios.get.mockResolvedValue({ data: [] })
  })

  test('shows the login form on the /login route', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    )

    expect(await screen.findByRole('heading', { name: /log in to application/i })).toBeInTheDocument()
  })

  test('shows blog information and hides action buttons for unauthenticated users', async () => {
    axios.get.mockResolvedValue({
      data: [
        {
          id: '1',
          title: 'Single blog test',
          author: 'Router Tester',
          url: 'https://example.com/blog',
          likes: 7,
          user: { username: 'demo', name: 'Demo User' },
        },
      ],
    })

    render(
      <MemoryRouter initialEntries={['/blogs/1']}>
        <App />
      </MemoryRouter>
    )

    expect(await screen.findByRole('heading', { name: /single blog test/i })).toBeInTheDocument()
    expect(screen.getByText(/router tester/i)).toBeInTheDocument()
    expect(screen.getByText(/likes 7/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /like/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
  })

  test('shows only the like button for authenticated non-creators', async () => {
    window.localStorage.setItem(
      'loggedBloglistUser',
      JSON.stringify({ token: 'abc123', username: 'other-user', name: 'Other User' })
    )

    axios.get.mockResolvedValue({
      data: [
        {
          id: '1',
          title: 'Single blog test',
          author: 'Router Tester',
          url: 'https://example.com/blog',
          likes: 7,
          user: { username: 'demo', name: 'Demo User' },
        },
      ],
    })

    render(
      <MemoryRouter initialEntries={['/blogs/1']}>
        <App />
      </MemoryRouter>
    )

    expect(await screen.findByRole('heading', { name: /single blog test/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
  })

  test('shows the delete button for the blog creator', async () => {
    window.localStorage.setItem(
      'loggedBloglistUser',
      JSON.stringify({ token: 'abc123', username: 'demo', name: 'Demo User' })
    )

    axios.get.mockResolvedValue({
      data: [
        {
          id: '1',
          title: 'Single blog test',
          author: 'Router Tester',
          url: 'https://example.com/blog',
          likes: 7,
          user: { username: 'demo', name: 'Demo User' },
        },
      ],
    })

    render(
      <MemoryRouter initialEntries={['/blogs/1']}>
        <App />
      </MemoryRouter>
    )

    expect(await screen.findByRole('heading', { name: /single blog test/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
  })

  test('shows the create-blog form on the /create route for logged-in users', async () => {
    window.localStorage.setItem(
      'loggedBloglistUser',
      JSON.stringify({ token: 'abc123', username: 'demo', name: 'Demo User' })
    )

    render(
      <MemoryRouter initialEntries={['/create']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByPlaceholderText('blog title')).toBeInTheDocument()
  })
})
