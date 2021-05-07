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
  DocumentReference,
  QueryDocumentSnapshot,
  UsersPropsCollection,
  UsersDate,
  DateFields,
  UsersUnsubscribeCollection
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
  dateIsFor: boolean = false

  prospects: Prospect[] = []
  dateCards: Prospect[] = []

  currentMatchingUser: string | null = null
  matchingUsers: UsersPropsCollection = {}
  unsubscribeUsers: UsersUnsubscribeCollection = {}

  constructor() {
    makeAutoObservable(this, {}, { deep: true })
  }

  get currentAffiliation() {
    return this.currentDate?.dateIsWith ? 'with' : 'for'
  }

  get cards(): UserCard[] {
    const dateCards = this.dateCards.map(c => ({ ...c, isDate: true }))
    const prospectCards = this.prospects.map(c => ({ ...c, isDate: false }))
    return [...dateCards, ...prospectCards]
  }

  get currentMatchingUserData(): UserData | null {
    if (!this.currentMatchingUser) return null
    return this.matchingUsers[this.currentMatchingUser].user
  }

  get currentDate(): UsersDate | null {
    if (!this.currentMatchingUser) return null
    return this.matchingUsers[this.currentMatchingUser].date
  }

  async setRaiting(fun: boolean, heart: boolean) {
    await this.updateCurrentDate('fun', { [this.currentAffiliation]: fun })
    await this.updateCurrentDate('heart', { [this.currentAffiliation]: heart })
    this.unsubscribeFromCurrentUser()
  }

  setJoinTime() {
    this.updateCurrentDate('timeJoin', {
      [this.currentAffiliation]: time.now()
    })
  }
  setLeftTime() {
    this.updateCurrentDate('timeLeft', {
      [this.currentAffiliation]: time.now()
    })
    if (this.currentDate)
      db.collection(DATES_COLLECTION)
        .doc(this.currentDate.id)
        .update({ active: false })
  }
  getEndTime() {
    if (!this.currentDate) return Date.now()
    const currentDateEndTimestamp = this.currentDate.end
    return currentDateEndTimestamp.seconds
  }

  async updateCurrentDate(field: DateFields, state: DateState) {
    if (!this.currentDate) return
    const currentDateRef = db
      .collection(DATES_COLLECTION)
      .doc(this.currentDate.id)
    await db.runTransaction(async t => {
      const actualDateDoc = await t.get(currentDateRef)
      const actualDate = actualDateDoc.data()
      if (!actualDate) return
      const current = actualDate[field] ? actualDate[field] : {}
      await t.update(currentDateRef, { [field]: { ...current, ...state } })
    })
  }

  resetCurrentMatchingUser() {
    user.setDateWith(null)
    this.currentMatchingUser = null
  }

  setCurrentMatchingUser(email: string) {
    user.setDateWith(email)
    this.currentMatchingUser = email
  }

  deleteMatchingUser(email: string) {
    if (this.unsubscribeUsers[email]) {
      this.unsubscribeUsers[email]()
      delete this.unsubscribeUsers[email]
    }
    delete this.matchingUsers[email]
  }

  unsubscribeFromCurrentUser() {
    if (!this.currentMatchingUserData) return
    const lastUserEmail = this.currentMatchingUserData.email
    if (this.unsubscribeUsers[lastUserEmail]) {
      this.unsubscribeUsers[lastUserEmail]()
      delete this.unsubscribeUsers[lastUserEmail]
    }
    delete this.matchingUsers[lastUserEmail]
    this.resetCurrentMatchingUser()
  }

  async checkCurrentUserAvability() {}

  async checkAvailability(callback: Function) {
    if (!user.free) return
    if (!user.here) return
    for (const [email, userProps] of Object.entries(this.matchingUsers)) {
      const matchingUserRef = db.collection(USERS_COLLECTION).doc(email)
      const dateRef = db.collection(DATES_COLLECTION).doc(userProps.date.id)
      const result = await db.runTransaction(async t => {
        const matchingUserDoc = await t.get(matchingUserRef)
        const dateDoc = await t.get(dateRef)
        const matchingUser = matchingUserDoc.data()
        const date = dateDoc.data()
        if (!date) return false
        if (!matchingUser) return false
        if (date.end.seconds < time.now().seconds || !date.active) {
          this.deleteMatchingUser(email)
          return false
        }
        if (!matchingUser.here) return false
        if (!matchingUser.free) return false
        if (matchingUser.dateWith && matchingUser.dateWith !== user.email)
          return false
        return true
      })
      console.log('complete result for ', email, result)
      if (!result) continue
      if (this.currentMatchingUser) continue
      this.setCurrentMatchingUser(email)
      callback()
    }
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

  setDateCards(dateCards: Prospect[]) {
    this.dateCards = dateCards
  }

  async shiftProspects(reject = false) {
    if (!user.email) return
    if (reject) await moveProspectTo('prospects', 'nexts', user.email)
    else {
      console.info('Creating date...')
      const room = await makeConferenceRoom()
      if (!room) return console.error('No room!')
      const forUser = await moveProspectTo('prospects', 'likes', user.email)
      const { roomUrl, start, end } = room
      console.info('Pushing date...')

      await db.collection(DATES_COLLECTION).add({
        start: time.fromDate(start),
        end: time.fromDate(end),
        room: roomUrl,
        for: forUser,
        with: user.email,
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
    if (!this.currentDate) return null
    const date = this.currentDate
    const room = date.room
    if (!user.name) return null
    const token = await getToken({ user_name: user.name })
    return {
      url: room,
      token
    } as Room
  }

  subscribeOnUser(email: string, date: UsersDate) {
    const onUser = (user: DocumentSnapshot) => {
      const userData = user.data()
      this.matchingUsers[email] = {
        user: userData as UserData,
        date
      }
      this.checkAvailability(() => app.setCountDownState())
    }

    return db.collection(USERS_COLLECTION).doc(email).onSnapshot(onUser)
  }

  checkUsersSubscription(dates: QueryDocumentSnapshot[], isWith: boolean) {
    const usersToSubscribe = dates.map(date =>
      isWith ? date.data().for : date.data().with
    )
    usersToSubscribe.forEach(email => {
      const dateDoc = dates.find(
        d => d.data()[isWith ? 'for' : 'with'] === email
      )
      if (!dateDoc)
        return console.error(`dateDoc with email ${email} not found`)
      const date: UsersDate = {
        id: dateDoc.id,
        accepted: dateDoc.data().accepted,
        active: dateDoc.data().active,
        start: dateDoc.data().start,
        end: dateDoc.data().end,
        for: dateDoc.data().for,
        with: dateDoc.data().with,
        room: dateDoc.data().room,
        timeJoin: dateDoc.data().timeJoin,
        timeLeft: dateDoc.data().timeLeft,
        fun: dateDoc.data().fun,
        heart: dateDoc.data().heart,
        dateIsWith: isWith
      }
      if (!this.unsubscribeUsers[email])
        this.unsubscribeUsers[email] = this.subscribeOnUser(email, date)
    })
  }

  subscribeOnDates() {
    const onDate = async (queryDates: QuerySnapshot, isWith: boolean) => {
      if (!user.email) return
      let dates = queryDates.docs.filter(byActive)
      const dateCards = await computeDateCards(dates, user.email)
      dates = dates.filter(byAccepted(true))
      if (dates) console.info('Available dates', dates.map(computeData))
      this.setDateCards(dateCards)
      this.checkUsersSubscription(dates, isWith)
    }

    db.collection(DATES_COLLECTION)
      .where('for', '==', user.email)
      .where('end', '>', time.now())
      .onSnapshot(d => onDate(d, false))
    db.collection(DATES_COLLECTION)
      .where('with', '==', user.email)
      .where('end', '>', time.now())
      .onSnapshot(d => onDate(d, true))
  }

  subscribeOnProspects() {
    const onProspects = async (doc: DocumentSnapshot) => {
      const prospects = doc.data()?.prospects

      for (const i in prospects) {
        try {
          prospects[i] = (await prospects[i].get()).data()
        } catch {
          console.error('Something wrong with prospects Array!')
        }
      }
      if (prospects) this.setProspects(prospects)
    }
    if (!user.email) return

    db.collection(PROSPECTS_COLLECTION).doc(user.email).onSnapshot(onProspects)
  }
}

async function computeDateCards(dates: DocumentSnapshot[], email: string) {
  const computedDataDates = dates.filter(byAccepted(false)).filter(byFor(email))
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

function computeData(doc: DocumentSnapshot) {
  return { ...doc.data(), id: doc.id }
}

function byActive(doc: DocumentData) {
  return !!doc.data()?.active
}

function byAccepted(state: boolean) {
  return (doc: DocumentData) => {
    return !!doc.data()?.accepted === state
  }
}

function byFor(email: string) {
  return (doc: DocumentData) => {
    return doc.data()?.for === email
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
