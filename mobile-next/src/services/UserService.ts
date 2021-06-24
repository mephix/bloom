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

  static async getUserById() {
    console.log(store.getState())
    const userDoc = await FirebaseService.db
      .collection(USERS_COLLECTION)
      .doc(this.id)
      .get()
    const userData = userDoc.data()
    return userData
  }
  static async createUser(data: InitUser) {
    store.getState()
    const userRef = FirebaseService.db.collection(USERS_COLLECTION).doc(this.id)
    await userRef.set({
      ...data
    })
  }
}
