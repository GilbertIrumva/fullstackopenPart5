// [5.1] GET /api/blogs
// [5.3] + setToken / create (POST a new blog with Authorization header)
// [5.8] + update (PUT a blog — used by the like button)
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

// [5.8] PUT the whole blog object back. The like flow does not require
// the Authorization header on the backend's current PUT handler, but we
// send it anyway so liking still works if/when that route is protected.
const update = async (id, updatedBlog) => {
  const config = { headers: { Authorization: token } }
  const response = await axios.put(`${baseUrl}/${id}`, updatedBlog, config)
  return response.data
}

export default { getAll, create, update, setToken }
