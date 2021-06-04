import { Timestamp } from '../../firebaseService'

export type UserState = {
  free?: boolean
  here?: boolean
  waitStartTime?: Timestamp
  dateWith?: string | null
}

export type DateState = {}

export interface UserData {
  bio: string
  id: string
  firstName: string
  free: boolean
  here: boolean
  dateWith?: string
}

export interface UsersDate {
  id: string
  accepted: boolean
  active: boolean
  start: Timestamp
  end: Timestamp
  for: string
  with: string
  room: string
  dateIsWith: boolean
  fun?: { for: boolean; with: boolean }
  heart?: { for: boolean; with: boolean }
  timeJoin?: { for: Timestamp; with: Timestamp }
  timeLeft?: { for: Timestamp; with: Timestamp }
  timeReplied?: Timestamp
  timeSent?: Timestamp
}

export type DateFields =
  | 'accepted'
  | 'active'
  | 'start'
  | 'end'
  | 'timeJoin'
  | 'timeLeft'
  | 'timeReplied'
  | 'timeSent'
  | 'rate'

export type RateToggles =
  | 'fun'
  | 'curious'
  | 'outgoing'
  | 'interesting'
  | 'creative'
  | 'goodListener'
  | 'asksInterestingQuestion'
  | 'heart'

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

export interface UserProps {
  user: UserData
  date: UsersDate
}

export interface UsersPropsCollection {
  [key: string]: UserProps
}

export interface UsersUnsubscribeCollection {
  [key: string]: Function
}

export interface Room {
  url: string
  token: string
}

// export type Date = {}
export type Prospect = {
  userId: string
  firstName: string
  bio: string
  avatar?: string
  dateId?: string
}

export type UserCard = {
  userId: string
  firstName: string
  bio: string
  avatar?: string
  isDate: boolean
  dateId?: string
}

export type StringDictionary = { [key: string]: string }
