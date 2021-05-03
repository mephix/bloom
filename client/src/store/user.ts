import { makeAutoObservable } from 'mobx'
import { db, time } from '../config/firebase'
import app from './app'
import firebase from 'firebase'

const USERS_COLLECTION = 'Users'
const DATES_COLLECTION = 'Dates'

type UserState = {
  free?: boolean
  here?: boolean
}

type QuerySnapshot = firebase.firestore.QuerySnapshot
type DocumentSnapshot = firebase.firestore.DocumentSnapshot

interface UserData {
  bio: string
  email: string
  firstName: string
  free: boolean
  here: boolean
}

interface Room {
  url: string
  token: string
}

class User {
  email: string | null = null

  here = false
  free = true
  hiddenHere = false

  availableDateRef: DocumentSnapshot | null = null
  matchingUser: UserData | null = null
  userUnsubscribe: Function | null = null

  constructor() {
    makeAutoObservable(this)
  }

  async setEmail(email: string) {
    const userRef = await db.collection(USERS_COLLECTION).doc(email).get()
    const user = userRef.data()
    if (!user) return console.error('User not found')
    this.email = user.email
    this.here = this.hiddenHere = user.here
    this.updateUserState({ free: true, here: this.here })
    app.setWaitingRoomState()
    this.subscribeOnDates()
  }

  setHere(state: boolean) {
    this.hiddenHere = this.here = state
    if (this.here) this.checkForAvailability()
    this.updateUserState({ here: this.here })
  }

  setHiddenHere(state: boolean) {
    if (state && !this.here) return
    this.hiddenHere = state
    if (this.hiddenHere) this.checkForAvailability()
    this.updateUserState({ here: this.hiddenHere })
  }

  setFree(state: boolean) {
    this.free = state
    this.updateUserState({ free: this.free })
  }

  async updateUserState(state: UserState) {
    if (this.email)
      await db.collection(USERS_COLLECTION).doc(this.email).update(state)
  }

  subscribeOnUser(email: string) {
    if (this.matchingUser) this.userUnsubscribe && this.userUnsubscribe()

    const onUser = (user: DocumentSnapshot) => {
      const userData = user.data()
      if (!userData) return this.userUnsubscribe && this.userUnsubscribe()
      this.matchingUser = userData as UserData
      this.checkForAvailability()
    }

    this.userUnsubscribe = db
      .collection(USERS_COLLECTION)
      .doc(email)
      .onSnapshot(onUser)
  }

  resetMatchingUser() {
    this.matchingUser = null
    this.userUnsubscribe && this.userUnsubscribe()
    this.availableDateRef = null
  }

  checkForAvailability() {
    if (!this.free) return
    const date = this.availableDateRef?.data()
    if (!date) return
    if (this.matchingUser?.here && this.here && this.free && date.active)
      return app.setCountDownState()
  }

  async getDateRoom(): Promise<Room | null> {
    if (!this.availableDateRef) return null
    const date = this.availableDateRef?.data()
    const room = await date?.room.get()
    const token = date?.token
    return {
      url: room.data().url,
      token,
    } as Room
  }

  subscribeOnDates() {
    const onDate = async (dates: QuerySnapshot, isFor: boolean) => {
      const date = dates.docs[0] && dates.docs[0].data()
      if (!date || date.start.seconds > time.now().seconds) return
      const matchingUserEmail = isFor ? date.with : date.for
      this.availableDateRef = dates.docs[0]
      this.subscribeOnUser(matchingUserEmail)
    }

    db.collection(DATES_COLLECTION)
      .where('for', '==', this.email)
      .where('end', '>', time.now())
      .onSnapshot(d => onDate(d, true))
    db.collection(DATES_COLLECTION)
      .where('with', '==', this.email)
      .where('end', '>', time.now())
      .onSnapshot(d => onDate(d, false))
  }
}

export default new User()
