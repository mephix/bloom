import { useCallback, useEffect } from 'react'
import app from '../store/app'
import user from '../store/user'

export const useInit = () => {
  const init = useCallback(async () => {
    await app.initParams()
    const email = getEmail()
    if (!email) return console.error('No email provided')
    user.setEmail(email)
    const blurHandler = () => user.setHiddenHere(false)
    const focusHandler = () => user.setHiddenHere(true)
    window.addEventListener('beforeunload', blurHandler)
    // window.addEventListener('blur', blurHandler)
    window.addEventListener('focus', focusHandler)
    return () => {
      window.removeEventListener('beforeunload', blurHandler)
      window.removeEventListener('blur', blurHandler)
      window.removeEventListener('focus', focusHandler)
    }
  }, [])

  useEffect(() => {
    init()
  }, [init])
}

function getEmail(): string | null {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('email')
}
