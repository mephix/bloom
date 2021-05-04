import { makeAutoObservable } from 'mobx'
import { db } from '../firebase'
import app from './app'
import date from './date'
import { UserState } from './types'
import { USERS_COLLECTION } from './constants'

class User {
  email: string | null = null

  here = false
  free = true
  hiddenHere = false

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
    date.subscribeOnDates()
    date.subscribeOnProspects()
  }

  setHere(state: boolean) {
    this.hiddenHere = this.here = state
    if (this.here) date.checkForAvailability()
    this.updateUserState({ here: this.here })
  }

  setHiddenHere(state: boolean) {
    if (state && !this.here) return
    this.hiddenHere = state
    if (this.hiddenHere) date.checkForAvailability()
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
}

export default new User()
