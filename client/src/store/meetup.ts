import { makeAutoObservable } from 'mobx'
import {
  UserCard,
  DateState,
  DocumentData,
  DocumentSnapshot,
  Prospect,
  QuerySnapshot,
  Room,
  UserData,
  DocumentReference
} from './utils/types'
import { db, time } from '../firebase'
import {
  DATES_COLLECTION,
  LIKES_COLLECTION,
  NEXTS_COLLECTION,
  PROSPECTS_COLLECTION,
  USERS_COLLECTION
} from './utils/constants'
import user from './user'
import app from './app'
import { getToken, makeConferenceRoom } from './utils/conference.api'

class Meetup {
  currentDateRef: DocumentSnapshot | null = null
  dateIsFor: boolean = false

  prospects: Prospect[] = []
  prospectsRef: DocumentSnapshot | null = null
  dateCards: Prospect[] = []

  matchingUser: UserData | null = null
  userUnsubscribe: Function | null = null

  constructor() {
    makeAutoObservable(this)
  }

  get affiliation() {
    return this.dateIsFor ? 'for' : 'with'
  }

  get cards(): UserCard[] {
    const dateCards = this.dateCards.map(c => ({ ...c, isDate: true }))
    const prospectCards = this.prospects.map(c => ({ ...c, isDate: false }))
    return [...dateCards, ...prospectCards]
  }

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
    if (this.currentDateRef)
      db.collection(DATES_COLLECTION)
        .doc(this.currentDateRef.id)
        .update({ active: false })
    this.matchingUser = null
    this.userUnsubscribe && this.userUnsubscribe()
    this.currentDateRef = null
  }

  checkForAvailability() {
    if (!user.free) return
    const date = this.currentDateRef?.data()
    if (!date) return

    if (
      this.matchingUser?.here &&
      this.matchingUser?.free &&
      user.here &&
      user.free &&
      date.active
    )
      return app.setCountDownState()
  }

  async shiftCards(reject = false) {
    if (!user.email) return
    if (!this.cards[0]) return
    if (this.cards[0].isDate) await this.shiftDates(reject)
    else await this.shiftProspects(reject)
  }

  setProspects(prospects: Prospect[]) {
    this.prospects = prospects
  }

  async shiftProspects(reject = false) {
    if (!user.email) return
    if (reject) await moveProspectTo('prospects', 'nexts', user.email)
    else {
      const withUser = await moveProspectTo('prospects', 'likes', user.email)
      const room = await makeConferenceRoom()
      if (!room) return
      const { roomUrl, start, end } = room
      await db.collection(DATES_COLLECTION).add({
        start: time.fromDate(start),
        end: time.fromDate(end),
        room: roomUrl,
        for: user.email,
        with: withUser,
        active: true,
        timeSent: time.now()
      })
    }
  }

  async shiftDates(reject = false) {
    if (!user.email) return
    if (reject) {
      await moveProspectTo('prospects', 'nexts', user.email)
      await db
        .collection(DATES_COLLECTION)
        .doc(this.dateCards[0].dateId)
        .update({ accepted: false, active: false, timeReplied: time.now() })
    } else {
      await moveProspectTo('prospects', 'likes', user.email)
      await db
        .collection(DATES_COLLECTION)
        .doc(this.dateCards[0].dateId)
        .update({ accepted: true, active: true, timeReplied: time.now() })
    }
  }

  async getRoom(): Promise<Room | null> {
    if (!this.currentDateRef) return null
    const date = this.currentDateRef?.data()
    const room = date?.room
    if (!user.name) return null
    const token = await getToken({ user_name: user.name })
    return {
      url: room,
      token
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
      if (!user.email) return
      let dates = queryDates.docs.filter(byActive)
      const dateCards = await computeDateCards(dates, user.email)
      dates = dates.filter(byAccepted(true))
      this.dateCards = dateCards
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

async function computeDateCards(dates: DocumentSnapshot[], email: string) {
  const computedDataDates = dates
    .filter(byAccepted(false))
    .filter(byWith(email))
  const cards: Prospect[] = []
  for (const date of computedDataDates) {
    const userGet = await db
      .collection(USERS_COLLECTION)
      .doc(date.data()?.for)
      .get()
    const user = userGet.data()
    if (!user) continue
    cards.push({
      firstName: user.firstName,
      bio: user.bio,
      email: user.email,
      dateId: date.id
    })
  }
  return cards
}

// function computeData(doc: DocumentSnapshot) {
//   return doc.data()
// }

function byActive(doc: DocumentData) {
  return !!doc.data()?.active
}

function byAccepted(state: boolean) {
  return (doc: DocumentData) => {
    return !!doc.data()?.accepted === state
  }
}

function byWith(email: string) {
  return (doc: DocumentData) => {
    return doc.data()?.with === email
  }
}
type CollectionSlug = 'prospects' | 'nexts' | 'likes'
async function checkProspectsCollection(
  collectionSlug: CollectionSlug,
  email: string | undefined
) {
  const collection = getCollectionBySlug(collectionSlug)
  const userProspectsRef = db.collection(collection).doc(email)
  const userProspects = await userProspectsRef.get()
  if (!userProspects.data()) {
    userProspectsRef.set({ [collectionSlug]: [] })
  }
  return userProspectsRef
}

function getCollectionBySlug(slug: CollectionSlug) {
  switch (slug) {
    case 'prospects':
      return PROSPECTS_COLLECTION
    case 'nexts':
      return NEXTS_COLLECTION
    case 'likes':
      return LIKES_COLLECTION
  }
}

async function moveProspectTo(
  from: CollectionSlug,
  to: CollectionSlug,
  email: string | undefined
) {
  const collectionFromRef = await checkProspectsCollection(from, email)
  const collectionToRef = await checkProspectsCollection(to, email)
  const fromUsers = (await collectionFromRef.get()).data()?.[from]
  if (!fromUsers.length) return
  let toUsers = (await collectionToRef.get()).data()?.[to]
  const cutUser = fromUsers.shift() as DocumentReference
  if (!cutUser) return
  toUsers = toUsers && toUsers.length ? toUsers : []
  await collectionFromRef.update({ [from]: [...fromUsers] })
  await collectionToRef.update({ [to]: [cutUser, ...toUsers] })
  const cutUserEmail = (await cutUser.get()).data()?.email
  return cutUserEmail
}

export default new Meetup()
