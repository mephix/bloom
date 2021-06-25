import { FirebaseService } from 'firebaseService'
import { USERS_COLLECTION } from 'firebaseService/constants'
import { Timestamp } from 'firebaseService/types'
import { store } from 'store'
import { setHere, updateUserData } from 'store/user'
import { Ages, Gender } from 'store/user/types'
// import store from 'store'

interface InitUser {
  firstName: string
  age: number
  gender: string
}

interface UserDataUpdate {
  bio?: string
  avatar?: string
  genderPreference?: Gender
  agePreferences?: Ages
}

interface UserState {
  free?: boolean
  here?: boolean
  waitStartTime?: Timestamp
  dateWith?: string | null
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
  static async updateAvatar(image: File): Promise<void> {
    const storageRef = FirebaseService.storage.ref()
    const [, type] = image.type.split('/')
    const avatarFileRef = storageRef.child(`${this.id}.${type}`)
    await avatarFileRef.put(image)
    const avatarUrl = await avatarFileRef.getDownloadURL()
    this.updateUserData({ avatar: avatarUrl })
  }

  static updateUserData(data: UserDataUpdate) {
    store.dispatch(updateUserData(data))
    return FirebaseService.db
      .collection(USERS_COLLECTION)
      .doc(this.id)
      .update(data)
  }

  static setHere(state: boolean) {
    store.dispatch(setHere(state))
    this.updateUserState({ here: state })
  }

  static setHiddenHere(state: boolean) {
    this.updateUserState({ here: state })
  }

  static async updateUserState(state: UserState) {
    await FirebaseService.db
      .collection(USERS_COLLECTION)
      .doc(this.id)
      .update(state)
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
