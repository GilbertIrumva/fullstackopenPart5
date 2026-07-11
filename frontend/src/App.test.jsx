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

  test('shows the single blog view on the /blogs/:id route', async () => {
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
  })

})
