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
            logger.log('Unregistered user! Trying to restore')

            const restoredUser = await UserService.tryRestoreUser()
            logger.log('Check collections')
            await UserService.checkUserCollections()
            logger.log('Collections checked!')
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
            logger.log('Geting user information')

            return dispatch(setAuth('without_information'))
          }
          logger.log('Check collections')
          await UserService.checkUserCollections()
          logger.log('Collections checked!')

          const userData = mapUserToUserData(user)
          logger.log('Authorize user')
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
