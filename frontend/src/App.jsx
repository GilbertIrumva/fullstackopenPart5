
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Blog from './components/Blog'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
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

  // [5.6] form fields moved into BlogForm; App no longer owns them.

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
      blogService.getAll().then((blogs) => setBlogs(sortBlogsByLikes(blogs)))
    }
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

  // [5.3] create a new blog, append it to the list
  // [5.5] also collapse the Togglable form after success
  // [5.6] called by BlogForm with { title, author, url }; returns a boolean
  //       so the child knows whether to clear its own inputs.
  const createBlog = async (blogToCreate) => {
    try {
      const created = await blogService.create(blogToCreate)
      setBlogs((prevBlogs) => sortBlogsByLikes(prevBlogs.concat(created)))
      blogFormRef.current?.toggleVisibility()
      notify(`a new blog '${created.title}' by ${created.author} added`)
      return true
    } catch (error) {
      const serverMsg = error?.response?.data?.error
      notify(serverMsg || 'failed to create blog', 'error')
      return false
    }
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
      {/* [5.6] the form itself is now its own component (BlogForm) */}
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={createBlog} />
      </Togglable>

      {/* [5.10] sort a copy by likes desc; never mutate state in place */}
      {/* [5.11] pass currentUsername so Blog can show its delete button
          only to the blog's creator */}
      {sortBlogsByLikes(blogs).map((blog) => (
          <Blog
            key={blog.id}
            blog={blog}
            updateBlog={updateBlog}
            removeBlog={removeBlog}
            currentUsername={user.username}
          />
        ))}
    </div>
  )
}

export default App
