
import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'

// Part 5 — Bloglist frontend
// [5.1] login form + conditional render
// [5.2] persist login in localStorage + logout
// [5.3] add new blog (form + POST with token)
// [5.4] success/error notifications
// [5.5] hide the new-blog form behind a Togglable button
//       NOTE: 5.5 only toggles the *new-blog* form. The login form is still
//       shown/hidden by the `if (user === null)` conditional from [5.1] —
//       it is intentionally NOT wrapped in Togglable.

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // [5.2] restore user from localStorage on first render
  const [user, setUser] = useState(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBloglistUser')
    return loggedUserJSON ? JSON.parse(loggedUserJSON) : null
  })

  // [5.4] notification: { message, type: 'success' | 'error' } | null
  const [notification, setNotification] = useState(null)

  // [5.3] new-blog form fields
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl] = useState('')

  // [5.5] ref to the Togglable wrapping the new-blog form,
  // so we can hide it after a successful create
  const blogFormRef = useRef()

  // [5.4] show a banner for a few seconds
  const notify = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  // [5.1] fetch blogs when a user is present
  // [5.3] also tell blogService which token to use for protected requests
  useEffect(() => {
    if (user) {
      blogService.setToken(user.token)
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
      notify('wrong username or password', 'error')
    }
  }

  // [5.2] logout clears localStorage + state
  const handleLogout = () => {
    window.localStorage.removeItem('loggedBloglistUser')
    blogService.setToken(null)
    setUser(null)
    setBlogs([])
  }

  // [5.3] create a new blog, append it to the list, clear the form
  // [5.5] also collapse the Togglable form after success
  const addBlog = async (event) => {
    event.preventDefault()
    try {
      const created = await blogService.create({
        title: newTitle,
        author: newAuthor,
        url: newUrl,
      })
      setBlogs(blogs.concat(created))
      setNewTitle('')
      setNewAuthor('')
      setNewUrl('')
      blogFormRef.current?.toggleVisibility()
      notify(`a new blog '${created.title}' by ${created.author} added`)
    } catch {
      notify('failed to create blog', 'error')
    }
  }

  // [5.1] not logged in → show only login form
  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification notification={notification} />
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
  // [5.3] + new-blog form
  return (
    <div>
      <h2>blogs</h2>
      <Notification notification={notification} />
      <p>
        {user.name} logged in{' '}
        <button type="button" onClick={handleLogout}>
          logout
        </button>
      </p>

      {/* [5.5] form is hidden by default; the Togglable button reveals it */}
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <h3>create new</h3>
        <form onSubmit={addBlog}>
          <div>
            title
            <input
              type="text"
              value={newTitle}
              name="Title"
              onChange={({ target }) => setNewTitle(target.value)}
            />
          </div>
          <div>
            author
            <input
              type="text"
              value={newAuthor}
              name="Author"
              onChange={({ target }) => setNewAuthor(target.value)}
            />
          </div>
          <div>
            url
            <input
              type="text"
              value={newUrl}
              name="Url"
              onChange={({ target }) => setNewUrl(target.value)}
            />
          </div>
          <button type="submit">create</button>
        </form>
      </Togglable>

      {blogs.map((blog) => (
        <Blog key={blog.id} blog={blog} />
      ))}
    </div>
  )
}

export default App
