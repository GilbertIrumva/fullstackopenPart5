// [5.5] Togglable: hides its children behind a button and exposes
// `toggleVisibility` to the parent through a ref, so the parent can
// close it (e.g. after a successful form submit).
//
// NOTE: in this app Togglable is used *only* for the new-blog form in
// App.jsx. The login form is NOT wrapped in Togglable — it is shown/hidden
// by the `if (user === null)` conditional in App.jsx (see [5.1]).
import { useState, forwardRef, useImperativeHandle } from 'react'

const Togglable = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  useImperativeHandle(ref, () => ({ toggleVisibility }))

  return (
    <div>
      <div style={hideWhenVisible}>
        <button type="button" onClick={toggleVisibility}>
          {props.buttonLabel}
        </button>
      </div>
      <div style={showWhenVisible}>
        {props.children}
        <button type="button" onClick={toggleVisibility}>
          cancel
        </button>
      </div>
    </div>
  )
})

Togglable.displayName = 'Togglable'

export default Togglable
