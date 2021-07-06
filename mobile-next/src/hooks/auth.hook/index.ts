import { FirebaseService } from 'firebaseService'
import { useEffect } from 'react'
import { UserService } from 'services/user.service'
import { useAppDispatch, useAppSelector } from 'store'
import { selectAuth, setAuth, setId, updateUserData } from 'store/user'
import { Logger } from 'utils'
import { mapUserToUserData } from './utils'

const logger = new Logger('Auth', 'red')

export const useAuth = () => {
  const auth = useAppSelector(selectAuth)
  const dispatch = useAppDispatch()

  useEffect(() => {
    return FirebaseService.auth().onAuthStateChanged(async firebaseUser => {
      try {
        if (firebaseUser) {
          const userId = firebaseUser.uid
          logger.log('Id', userId)
          dispatch(setId(userId))
          const user = await UserService.getUser()
          if (!user) {
            const restoredUser = await UserService.tryRestoreUser(userId)
            await UserService.checkUserCollections()
            if (restoredUser) {
              const userData = mapUserToUserData(restoredUser)
              dispatch(updateUserData(userData))
              await UserService.updateUserData({
                bio: restoredUser.bio || '',
                avatar: restoredUser.avatar || '',
                genderPreference: restoredUser.genderPreference,
                agePreferences: restoredUser.agePreferences
              })
              return dispatch(setAuth('authorized'))
            }
            return dispatch(setAuth('without_information'))
          }
          await UserService.checkUserCollections()
          const userData = mapUserToUserData(user)
          dispatch(updateUserData(userData))
          dispatch(setAuth('authorized'))
        } else dispatch(setAuth('unauthorized'))
      } catch (err) {
        logger.error(err)
      }
    })
  }, [dispatch])

  return auth
}
