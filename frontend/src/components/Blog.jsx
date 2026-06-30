// [5.1] minimal blog row: title + author
// [5.7] expandable row: title + author always visible, with a "view" button
//       that toggles a local `visible` state to show/hide url, likes, and
//       the blog's user. The like button is wired up but has no behavior
//       yet (added in a later exercise). Inline styles per the FSO hint.
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

const Blog = ({ blog }) => {
  const [visible, setVisible] = useState(false)

  const toggleVisible = () => setVisible(!visible)

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
            <button type="button">like</button>
          </div>
          {blog.user && <div>{blog.user.name}</div>}
        </div>
      )}
    </div>
  )
}

export default Blog
