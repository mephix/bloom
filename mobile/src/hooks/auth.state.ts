import { auth, db, USERS_COLLECTION } from 'firebaseService'
import { useEffect } from 'react'
import user from 'state/user'

export const useAuthState = () => {
  useEffect(
    () =>
      auth().onAuthStateChanged(async firebaseUser => {
        if (firebaseUser) {
          const userId = firebaseUser.uid
          const userDoc = await db
            .collection(USERS_COLLECTION)
            .doc(userId)
            .get()
          const userData = userDoc.data()
          if (!userData) {
            user.setId(userId)
            return user.setAuth('without_information')
          }

          user.setUser({
            id: userId,
            firstName: userData.firstName,
            bio: userData.bio,
            avatar: userData.avatar,
            finished: userData.finished,
            meetGender: userData.meetGender,
            meetAges: userData.meetAges
          })
          user.setAuth('authorized')
        } else user.setAuth('unauthorized')
      }),
    []
  )
}
