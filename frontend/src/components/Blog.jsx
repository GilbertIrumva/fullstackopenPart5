// [5.1] minimal blog row: title + author
// [5.7] expandable row: title + author always visible, with a "view" button
//       that toggles a local `visible` state to show/hide url, likes, and
//       the blog's user. The like button is wired up but has no behavior
//       yet (added in a later exercise). Inline styles per the FSO hint.
// [5.8] like button now PUTs the blog back with likes + 1 via the
//       `updateBlog` prop provided by App. We send the user as an id
//       (not the populated object) so Mongoose stores the reference.
//
// NOTE: we intentionally do NOT reuse Togglable here. Togglable hides ALL
// its children behind the button; this component must keep title+author
// visible at all times and only toggle the extra details.
import { useState } from 'react'

const blogStyle = {
  paddingTop: 10,
  paddingLeft: 2,
  border: 'solid',
  borderWidth: 1,
  marginBottom: 5,
}

const Blog = ({ blog, updateBlog }) => {
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

  return (
    <div style={blogStyle}>
      <div>
        {blog.title} {blog.author}{' '}
        <button type="button" onClick={toggleVisible}>
          {visible ? 'hide' : 'view'}
        </button>
      </div>
      {visible && (
        <div>
          <div>{blog.url}</div>
          <div>
            likes {blog.likes}{' '}
            <button type="button" onClick={handleLike}>
              like
            </button>
          </div>
          {blog.user && <div>{blog.user.name}</div>}
        </div>
      )}
    </div>
  )
}

export default Blog
