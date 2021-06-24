import { FirebaseService } from 'firebaseService'
import { USERS_COLLECTION } from 'firebaseService/constants'
import { userDataDefaults } from 'store/user'
import { UserData } from 'store/user/types'

export async function fetchUserById(id: string) {
  const userDoc = await FirebaseService.db
    .collection(USERS_COLLECTION)
    .doc(id)
    .get()
  const userData = userDoc.data()
  return userData
}

export function mapUserToUserData(user: any): UserData {
  return {
    firstName: user.firstName,
    bio: user.bio || userDataDefaults.bio,
    avatar: user.avatar || userDataDefaults.avatar,
    finished: user.finished || userDataDefaults.finished,
    genderPreference:
      user.genderPreference || userDataDefaults.genderPreference,
    agePreferences: user.agePreferences || userDataDefaults.agePreferences
  }
}
