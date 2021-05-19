import { Timestamp } from '../../firebase'

export type UserState = {
  free?: boolean
  here?: boolean
  waitStartTime?: Timestamp
  dateWith?: string | null
}

export type DateState = {}

export interface UserData {
  bio: string
  email: string
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
  | 'fun'
  | 'heart'
  | 'timeJoin'
  | 'timeLeft'
  | 'timeReplied'
  | 'timeSent'

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
  email: string
  firstName: string
  bio: string
  face?: string
  dateId?: string
}

export type UserCard = {
  email: string
  firstName: string
  bio: string
  face?: string
  isDate: boolean
  dateId?: string
}

export type StringDictionary = { [key: string]: string }
