
import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const ok = await createBlog({ title, author, url })
    if (ok) {
      setTitle('')
      setAuthor('')
      setUrl('')
    }
  }

  return (
    <div className="blog-form">
      <h3>create new</h3>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">title</label>
          <input
            id="title"
            type="text"
            value={title}
            name="Title"
            placeholder="blog title"
            className="form-input"
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="author">author</label>
          <input
            id="author"
            type="text"
            value={author}
            name="Author"
            placeholder="blog author"
            className="form-input"
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="url">url</label>
          <input
            id="url"
            type="text"
            value={url}
            name="Url"
            placeholder="blog url"
            className="form-input"
            onChange={({ target }) => setUrl(target.value)}
          />
        </div>
        <button type="submit" className="form-button">create</button>
      </form>
    </div>
  )
}

export default BlogForm
