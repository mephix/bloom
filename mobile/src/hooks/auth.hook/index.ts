import { FirebaseService } from 'firebaseService'
import { fetchUserById } from 'firebaseService/utils'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'store'
import { selectAuth, setAuth, setId, setUserData } from 'store/user'
import { mapUserToUserData } from './utils'

export const useAuth = () => {
  const auth = useAppSelector(selectAuth)
  const dispatch = useAppDispatch()

  useEffect(() => {
    return FirebaseService.auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        const userId = firebaseUser.uid
        const user = await fetchUserById(userId)
        dispatch(setId(userId))
        if (!user) return dispatch(setAuth('without_information'))

        const userData = mapUserToUserData(user)
        dispatch(setUserData(userData))
        dispatch(setAuth('authorized'))
      } else dispatch(setAuth('unauthorized'))
    })
  }, [dispatch])

  return auth
}