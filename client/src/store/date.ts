import { makeAutoObservable } from 'mobx'
import {
  DateState,
  // DocumentData,
  DocumentSnapshot,
  Prospect,
  QuerySnapshot,
  Room,
  UserData,
} from './types'
import { db, time } from '../firebase'
import {
  DATES_COLLECTION,
  // NEXTS_COLLECTION,
  PROSPECTS_COLLECTION,
  USERS_COLLECTION,
} from './constants'
import user from './user'
import app from './app'

class Date {
  currentDateRef: DocumentSnapshot | null = null
  dateIsFor: boolean = false

  prospects: Prospect[] = []
  prospectsRef: DocumentSnapshot | null = null

  matchingUser: UserData | null = null
  userUnsubscribe: Function | null = null

  constructor() {
    makeAutoObservable(this)
  }

  get affiliation() {
    return this.dateIsFor ? 'for' : 'with'
  }

  // get cards() {

  // }

  setRaiting(fun: boolean, heart: boolean) {
    this.updateCurrentDate('fun', { [this.affiliation]: fun })
    this.updateCurrentDate('heart', { [this.affiliation]: heart })
  }

  setJoinTime() {
    this.updateCurrentDate('timeJoin', { [this.affiliation]: time.now() })
  }
  setLeftTime() {
    this.updateCurrentDate('timeLeft', { [this.affiliation]: time.now() })
  }

  async updateCurrentDate(field: string, state: DateState) {
    const currentDate = this.currentDateRef?.data()
    if (!currentDate) return
    const current = currentDate[field] ? currentDate[field] : {}
    if (this.currentDateRef)
      await db
        .collection(DATES_COLLECTION)
        .doc(this.currentDateRef.id)
        .update({ [field]: { ...current, ...state } })
  }

  resetMatchingUser() {
    this.matchingUser = null
    this.userUnsubscribe && this.userUnsubscribe()
    this.currentDateRef = null
  }

  checkForAvailability() {
    if (!user.free) return
    const date = this.currentDateRef?.data()
    if (!date) return
    if (this.matchingUser?.here && user.here && user.free && date.active)
      return app.setCountDownState()
  }

  async unshiftProspects(reject = false) {
    console.log('unshift', reject)
    if (!user.email) return
    // const nextsRef = db.collection(NEXTS_COLLECTION).doc(user.email)
    // nextsRef.set({ nexts: ['1'] })
  }

  setProspects(prospects: Prospect[]) {
    this.prospects = prospects
  }

  async getRoom(): Promise<Room | null> {
    if (!this.currentDateRef) return null
    const date = this.currentDateRef?.data()
    const room = await date?.room.get()
    const token = date?.token
    return {
      url: room.data().url,
      token,
    } as Room
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

  subscribeOnDates() {
    const onDate = async (queryDates: QuerySnapshot, isFor: boolean) => {
      let dates = queryDates.docs.filter(byActive)
      // const dateCards = computeDateCards(dates, isFor)

      const date = dates[0] && dates[0].data()
      if (!date || date.start.seconds > time.now().seconds) return
      if (!date.active) return
      const matchingUserEmail = isFor ? date.with : date.for
      this.currentDateRef = dates[0]
      this.dateIsFor = isFor
      this.subscribeOnUser(matchingUserEmail)
    }

    db.collection(DATES_COLLECTION)
      .where('for', '==', user.email)
      .where('end', '>', time.now())
      .onSnapshot(d => onDate(d, true))
    db.collection(DATES_COLLECTION)
      .where('with', '==', user.email)
      .where('end', '>', time.now())
      .onSnapshot(d => onDate(d, false))
  }

  subscribeOnProspects() {
    const onProspects = async (doc: DocumentSnapshot) => {
      const prospects = doc.data()?.prospects
      this.prospectsRef = doc
      for (const i in prospects) {
        prospects[i] = (await prospects[i].get()).data()
      }
      if (prospects) this.setProspects(prospects)
    }
    if (!user.email) return

    db.collection(PROSPECTS_COLLECTION).doc(user.email).onSnapshot(onProspects)
  }
}

// function computeDateCards(dates: DocumentSnapshot[], isFor: boolean) {
//   const computedDataDates = dates.map(computeData)
// }
// function computeData(doc: DocumentSnapshot) {
//   return doc.data()
// }

function byActive(doc: DocumentSnapshot) {
  return !!doc.data()?.active
}

// function byAccepted(state: boolean) {
//   return (doc: DocumentData) => {
//     return !!doc?.accepted === state
//   }
// }

export default new Date()
