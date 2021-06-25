import { Timestamp } from 'firebaseService/types'

export type MatchType = 'both' | 'me' | 'unknown'

export interface UserMatch {
  dateId: string
  userId: string
  dateEnd: Timestamp
  firstName: string
  avatar: string
  bio: string
  type: MatchType
}
