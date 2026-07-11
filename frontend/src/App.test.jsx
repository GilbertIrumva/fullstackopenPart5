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

})
