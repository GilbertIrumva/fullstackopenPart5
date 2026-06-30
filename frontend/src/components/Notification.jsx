// [5.4] notification banner — green for success, red for error
const Notification = ({ notification }) => {
  if (!notification) return null

  const { message, type } = notification

  const style = {
    padding: 10,
    border: '2px solid',
    borderRadius: 4,
    marginBottom: 10,
    background: '#eee',
    color: type === 'error' ? 'red' : 'green',
  }

  return <div style={style}>{message}</div>
}

export default Notification
