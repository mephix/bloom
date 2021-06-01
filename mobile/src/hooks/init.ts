import { auth, db, USERS_COLLECTION } from 'firebaseService'
import { useEffect } from 'react'
import user from 'state/user'

export const useInit = () => {
  useEffect(() => {
    document.body.classList.toggle('dark', true)

    auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        const userId = firebaseUser.uid
        const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get()
        if (!userDoc.data()) {
          user.setId(userId)
          return user.setAuth('without_information')
        }
        user.setAuth('authorized')
      } else user.setAuth('unauthorized')
    })
  }, [])
}
