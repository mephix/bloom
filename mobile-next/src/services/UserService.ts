import { FirebaseService } from 'firebaseService'
import { USERS_COLLECTION } from 'firebaseService/constants'
import { store } from 'store'
// import store from 'store'

interface InitUser {
  firstName: string
  age: number
  gender: string
}

export class UserService {
  static get id() {
    return store.getState().user.id
  }

  static async getUser() {
    const userDoc = await FirebaseService.db
      .collection(USERS_COLLECTION)
      .doc(this.id)
      .get()
    const userData = userDoc.data()
    return userData
  }
  static async createUser(data: InitUser) {
    const userRef = FirebaseService.db.collection(USERS_COLLECTION).doc(this.id)
    await userRef.set({
      ...data
    })
  }
  static tryRestoreUser() {}
}

// const restoreUserQuery = await db
//         .collection(RESTORE_USERS_COLLECTION)
//         .where('phone', '==', register.phone.trim())
//         .get()
//       const [restoreUserDoc] = restoreUserQuery.docs
//       if (restoreUserDoc) {
//         const restoreUser = restoreUserDoc.data()
//         await userRef.set({
//           firstName: restoreUser.firstName,
//           age: restoreUser.age,
//           gender: restoreUser.gender
//         })
//         user.setUser({
//           id: userId,
//           firstName: restoreUser.firstName
//         })
//         user.updateUserData({
//           bio: restoreUser.bio || '',
//           avatar: restoreUser.avatar || '',
//           genderPreference: restoreUser.genderPreference,
//           agePreferences: restoreUser.agePreferences,
//           email: restoreUserDoc.id
//         })
//         return user.setAuth('authorized')
