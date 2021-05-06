import firebase from 'firebase'

export type UserState = {
  free?: boolean
  here?: boolean
}

export type DateState = {}

export type QuerySnapshot = firebase.firestore.QuerySnapshot
export type QueryDocumentSnapshot = firebase.firestore.QueryDocumentSnapshot
export type DocumentSnapshot = firebase.firestore.DocumentSnapshot
export type DocumentData = firebase.firestore.DocumentData
export type DocumentReference = firebase.firestore.DocumentReference
export type Timestamp = firebase.firestore.Timestamp

export interface UserData {
  bio: string
  email: string
  firstName: string
  free: boolean
  here: boolean
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
  dateIsFor: boolean
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
  dateId?: string
}

export type UserCard = {
  email: string
  firstName: string
  bio: string
  isDate: boolean
  dateId?: string
}

export type StringDictionary = { [key: string]: string }
