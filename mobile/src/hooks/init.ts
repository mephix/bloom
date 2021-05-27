import { auth } from 'firebaseService'
import { useEffect } from 'react'
import user from 'state/user'

export const useInit = () => {
  useEffect(() => {
    auth().onAuthStateChanged(firebaseUser => {
      console.log('usr', firebaseUser)
      if (firebaseUser) user.setAuth(true)
      else user.setAuth(false)
    })
  }, [])
}
