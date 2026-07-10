
import { useState } from 'react'

const blogStyle = {
  paddingTop: 10,
  paddingLeft: 2,
  border: 'solid',
  borderWidth: 1,
  marginBottom: 5,
}

// [5.11] make the destructive action visually distinct
const removeButtonStyle = {
  backgroundColor: '#ff6b6b',
  color: 'white',
  border: 'none',
  padding: '4px 10px',
  borderRadius: 3,
  cursor: 'pointer',
  marginTop: 4,
}

const Blog = ({ blog, updateBlog, removeBlog, currentUsername }) => {
  const [visible, setVisible] = useState(false)

  const toggleVisible = () => setVisible(!visible)

  const handleLike = () => {
    // blog.user may be a populated object ({ id, username, name }) from the
    // GET, or just an id string. The backend expects an ObjectId reference.
    const userId =
      blog.user && typeof blog.user === 'object' ? blog.user.id : blog.user

    updateBlog(blog.id, {
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: blog.likes + 1,
      user: userId,
    })
  }

  const handleRemove = () => {
    if (window.confirm(`Remove blog '${blog.title}' by ${blog.author}?`)) {
      removeBlog(blog)
    }
  }

  // [5.11] only the creator sees the delete button. Older blogs without a
  // populated user are treated as not-owned-by-anyone.
  const canDelete =
  blog.user &&
  typeof blog.user === 'object' &&
  blog.user.username === currentUsername


  return (
    <div style={blogStyle} className="blog">
      <div className="blog-header">
        {blog.title} {blog.author}{' '}
        <button type="button" onClick={toggleVisible}>
          {visible ? 'hide' : 'view'}
        </button>
      </div>
      {visible && (
        <div className="blog-details">
          <div>{blog.url}</div>
          <div>
            likes {blog.likes}{' '}
            <button type="button" onClick={handleLike}>
              like
            </button>
          </div>
          {blog.user && <div>{blog.user.name}</div>}
          {canDelete && (
            <button type="button" onClick={handleRemove} style={removeButtonStyle}>
              remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog
