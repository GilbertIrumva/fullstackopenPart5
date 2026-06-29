// [5.1] minimal blog row: title + author
const Blog = ({ blog }) => (
  <div>
    {blog.title} {blog.author}
  </div>
)

export default Blog
