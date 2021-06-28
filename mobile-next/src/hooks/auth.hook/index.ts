import { FirebaseService } from 'firebaseService'
import { useEffect } from 'react'
import { UserService } from 'services/user.service'
import { useAppDispatch, useAppSelector } from 'store'
import { selectAuth, setAuth, setId, updateUserData } from 'store/user'
import { mapUserToUserData } from './utils'

export const useAuth = () => {
  const auth = useAppSelector(selectAuth)
  const dispatch = useAppDispatch()

  useEffect(() => {
    return FirebaseService.auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        const userId = firebaseUser.uid
        dispatch(setId(userId))
        const user = await UserService.getUser()
        if (!user) {
          // TODO: Restoring users
          // const userData =
          return dispatch(setAuth('without_information'))
        }

        const userData = mapUserToUserData(user)
        dispatch(updateUserData(userData))
        dispatch(setAuth('authorized'))
      } else dispatch(setAuth('unauthorized'))
    })
  }, [dispatch])

  return auth
}
