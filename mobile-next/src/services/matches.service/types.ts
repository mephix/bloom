export type MatchType = 'both' | 'me' | 'unknown'

export interface UserMatch {
  dateId: string
  userId: string
  dateEnd: number
  firstName: string
  avatar: string
  bio: string
  type: MatchType
}
