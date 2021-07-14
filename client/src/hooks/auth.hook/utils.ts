import { userDataDefaults } from 'store/user'
import { UserData } from 'store/user/types'

export function mapUserToUserData(user: any): UserData {
  return {
    firstName: user.firstName,
    bio: user.bio || userDataDefaults.bio,
    avatar: user.avatar || userDataDefaults.avatar,
    finished: user.finished || userDataDefaults.finished,
    genderPreference:
      user.genderPreference || userDataDefaults.genderPreference,
    agePreferences: user.agePreferences || userDataDefaults.agePreferences,
    socialMedia: user.socialMedia || userDataDefaults.socialMedia
  }
}
