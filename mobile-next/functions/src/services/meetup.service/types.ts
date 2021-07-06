export enum CardType {
  Prospect = 'prospect',
  Date = 'date'
}

export interface UserCard {
  userId: string
  firstName: string
  avatar: string
  bio: string
  type: CardType
  dateId?: string
}

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

export interface UserMatchInfo {
  id: string
  type: MatchType
}
