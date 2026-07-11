// [5.1] GET /api/blogs
// [5.3] + setToken / create (POST a new blog with Authorization header)
// [5.8] + update (PUT a blog — used by the like button)
// [5.11] + remove (DELETE a blog — used by the delete button; backend
//         enforces that only the creator can delete)
import axios from 'axios'

const baseUrl = '/api/blogs'

let token = null

const setToken = (newToken) => {
  token = newToken ? `Bearer ${newToken}` : null
}

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then((response) => response.data)
}

const create = async (newBlog) => {
  const config = { headers: { Authorization: token } }
  const response = await axios.post(baseUrl, newBlog, config)
  return response.data
}

// send it anyway so liking still works if/when that route is protected.
const update = async (id, updatedBlog) => {
  const config = { headers: { Authorization: token } }
  const response = await axios.put(`${baseUrl}/${id}`, updatedBlog, config)
  return response.data
}

// [5.11] DELETE a blog. The backend requires the token and 403s if the
// caller is not the original creator.
const remove = async (id) => {
  const config = { headers: { Authorization: token } }
  const response = await axios.delete(`${baseUrl}/${id}`, config)
  return response.data
}

export default { getAll, create, update, remove, setToken }
