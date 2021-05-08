import { useCallback, useEffect } from 'react'
import app from '../store/app'
import user from '../store/user'

export const useInit = () => {
  const init = useCallback(async () => {
    await app.initParams()
    const email = getEmail()
    if (!email) return console.error('No email provided')
    user.setEmail(email)
    const closeHandler = () => user.setHiddenHere(false)
    const visibilityChangeHandler = () => {
      if (document.hidden) user.setHiddenHere(false)
      else {
        user.setHiddenHere(true)
      }
    }
    window.addEventListener('beforeunload', closeHandler)
    window.addEventListener('visibilitychange', visibilityChangeHandler)
    return () => {
      window.removeEventListener('beforeunload', closeHandler)
      window.removeEventListener('visibilitychange', visibilityChangeHandler)
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
