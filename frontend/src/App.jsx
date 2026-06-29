
import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // [5.2] restore user from localStorage on first render
  const [user, setUser] = useState(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBloglistUser')
    return loggedUserJSON ? JSON.parse(loggedUserJSON) : null
  })

  const [errorMessage, setErrorMessage] = useState(null)

  // [5.1] fetch blogs when a user is present
  useEffect(() => {
    if (user) {
      blogService.getAll().then((blogs) => setBlogs(blogs))
    }
  }, [user])

  // [5.1] login → token in state
  // [5.2] also save user to localStorage
  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const loggedUser = await loginService.login({ username, password })
      window.localStorage.setItem(
        'loggedBloglistUser',
        JSON.stringify(loggedUser)
      )
      setUser(loggedUser)
      setUsername('')
      setPassword('')
    } catch {
      setErrorMessage('wrong username or password')
      setTimeout(() => setErrorMessage(null), 5000)
    }
  }

  // [5.2] logout clears localStorage + state
  const handleLogout = () => {
    window.localStorage.removeItem('loggedBloglistUser')
    setUser(null)
    setBlogs([])
  }

  const errorNotification = () =>
    errorMessage && (
      <div style={{ color: 'red', border: '1px solid red', padding: 8 }}>
        {errorMessage}
      </div>
    )

  // [5.1] not logged in → show only login form
  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        {errorNotification()}
        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
            <input
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  // [5.1] logged-in view
  // [5.2] + logout button
  return (
    <div>
      <h2>blogs</h2>
      {errorNotification()}
      <p>
        {user.name} logged in{' '}
        <button type="button" onClick={handleLogout}>
          logout
        </button>
      </p>
      {blogs.map((blog) => (
        <Blog key={blog.id} blog={blog} />
      ))}
    </div>
  )
}

export default App
