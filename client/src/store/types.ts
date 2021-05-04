import firebase from 'firebase'

export type UserState = {
  free?: boolean
  here?: boolean
}

export type DateState = {}

export type QuerySnapshot = firebase.firestore.QuerySnapshot
export type DocumentSnapshot = firebase.firestore.DocumentSnapshot
export type DocumentData = firebase.firestore.DocumentData

export interface UserData {
  bio: string
  email: string
  firstName: string
  free: boolean
  here: boolean
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
}

export type StringDictionary = { [key: string]: string }
