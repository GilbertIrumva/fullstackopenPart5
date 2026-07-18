// [5.4] notification banner — green for success, red for error
const Notification = ({ notification }) => {
  if (!notification) return null

  const { message, type } = notification
  const className = `notification notification--${type}`

  return <div className={className}>{message}</div>
}

export default Notification
