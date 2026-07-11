
import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Blog from './components/Blog'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

const sortBlogsByLikes = (blogs) => [...blogs].sort((a, b) => b.likes - a.likes)

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
  const navigate = useNavigate()

  // [5.6] form fields moved into BlogForm; App no longer owns them.

  // [5.4] show a banner for a few seconds
  const notify = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  // [5.1] fetch blogs when a user is present
  // [5.3] also tell blogService which token to use for protected requests
  useEffect(() => {
    blogService.setToken(user?.token ?? null)
    blogService.getAll().then((blogs) => setBlogs(sortBlogsByLikes(blogs)))
  }, [user])

  // [aux] auto-logout on 401 from an expired/invalid token. Installed
  // once on mount; ejected on unmount so dev hot-reloads don't stack
  // multiple interceptors.
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status
        const serverMsg = error?.response?.data?.error
        // covers: 'token expired', 'token invalid',
        // and 'token missing or invalid' (user deleted but token still valid)
        const looksLikeAuth =
          typeof serverMsg === 'string' && serverMsg.toLowerCase().includes('token')
        if (status === 401 && looksLikeAuth) {
          window.localStorage.removeItem('loggedBloglistUser')
          blogService.setToken(null)
          setUser(null)
          setBlogs([])
          notify('session expired, please log in again', 'error')
        }
        return Promise.reject(error)
      }
    )
    return () => axios.interceptors.response.eject(id)
  }, [])

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
      navigate('/')
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
    navigate('/')
  }

  // [5.8] PUT the blog back and swap it in the local list. The Blog
  //       component calls this from its like button.
  const updateBlog = async (id, updatedBlog) => {
    try {
      const returned = await blogService.update(id, updatedBlog)
      setBlogs((prevBlogs) => sortBlogsByLikes(prevBlogs.map((b) => (b.id === id ? returned : b))))
    } catch (error) {
      const serverMsg = error?.response?.data?.error
      notify(serverMsg || 'failed to update blog', 'error')
    }
  }

  // [5.11] DELETE the blog and drop it from the local list. The Blog
  //       component handles its own window.confirm() prompt before calling
  //       this, so we only get here once the user has agreed.
  const removeBlog = async (blog) => {
    try {
      await blogService.remove(blog.id)
      setBlogs((prevBlogs) => sortBlogsByLikes(prevBlogs.filter((b) => b.id !== blog.id)))
      notify(`removed '${blog.title}' by ${blog.author}`)
    } catch (error) {
      const serverMsg = error?.response?.data?.error
      notify(serverMsg || 'failed to delete blog', 'error')
    }
  }

  const loginForm = () => (
    <div>
      <h2>Log in to application</h2>
      <Notification notification={notification} />
      {user && <p>{user.name} logged in</p>}
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

  const blogList = () => (
    <div>
      <h2>blogs</h2>
      <Notification notification={notification} />
      {user && (
        <p>
          {user.name} logged in{' '}
          <button type="button" onClick={handleLogout}>
            logout
          </button>
        </p>
      )}

      {/* [5.10] sort a copy by likes desc; never mutate state in place */}
      {/* [5.11] pass currentUsername so Blog can show its delete button
          only to the blog's creator */}
      {sortBlogsByLikes(blogs).map((blog) => (
        <Blog
          key={blog.id}
          blog={blog}
          updateBlog={updateBlog}
          removeBlog={removeBlog}
          currentUsername={user?.username}
        />
      ))}
    </div>
  )

  return (
    <div>
      <nav>
        <Link to="/">blogs</Link>{' '}
        {user ? (
          <button type="button" onClick={handleLogout}>logout</button>
        ) : (
          <Link to="/login">login</Link>
        )}
      </nav>
      <Routes>
        <Route path="/" element={blogList()} />
        <Route path="/login" element={loginForm()} />
      </Routes>
    </div>
  )
}

export default App
