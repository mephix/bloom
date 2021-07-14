export type AuthStatus =
  | 'authorized'
  | 'unauthorized'
  | 'unknown'
  | 'without_information'

export type Gender = 'm' | 'f' | 'x' | ''

export interface Ages {
  low: number
  high: number
}

export interface UserData {
  firstName: string
  bio: string
  socialMedia: string
  avatar: string
  finished: boolean
  genderPreference: Gender
  agePreferences: Ages
}

export interface UpdateUserData {
  firstName?: string
  bio?: string
  avatar?: string
  finished?: boolean
  genderPreference?: Gender
  agePreferences?: Ages
}
