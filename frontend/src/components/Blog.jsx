
import { useState } from 'react'

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
    <div className="blog">
      <div className="blog-header">
        <div>
          <h3 className="blog-title">{blog.title}</h3>
          <div className="blog-author">by {blog.author}</div>
        </div>
        <button type="button" onClick={toggleVisible} className="blog-toggle">
          {visible ? 'hide' : 'view'}
        </button>
      </div>
      {visible && (
        <div className="blog-details">
          <div className="blog-url">
            <a href={blog.url} target="_blank" rel="noreferrer">{blog.url}</a>
          </div>
          <div className="blog-meta">
            {blog.user && <div className="blog-owner">added by {blog.user.name}</div>}
            <div className="blog-actions">
              <span className="blog-like-count">{blog.likes} likes</span>
              <button type="button" onClick={handleLike} className="blog-button blog-button--like">
                like
              </button>
              {canDelete && (
                <button type="button" onClick={handleRemove} className="blog-button blog-button--remove">
                  remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Blog
