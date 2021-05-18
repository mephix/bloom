import { makeAutoObservable } from 'mobx'
import {
  UserCard,
  DateState,
  Prospect,
  Room,
  UserData,
  UsersPropsCollection,
  UsersDate,
  DateFields,
  UsersUnsubscribeCollection
} from './utils/types'
import {
  db,
  time,
  DATES_COLLECTION,
  PROSPECTS_COLLECTION,
  USERS_COLLECTION,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  QuerySnapshot
} from '../firebase'
import user from './user'
import app from './app'
import { ConferenceService } from '../services/conference.service'
import { Logger, LogGroup } from '../utils/Logger'
import { byAccepted, byActive, computeData } from '../utils'
import {
  computeDateCards,
  dateDocToUsersDate,
  moveProspectTo
} from './meetup.utils'

const logger = new Logger('Meetup', '#10c744')

class Meetup {
  // private dateIsFor: boolean = false
  private prospects: Prospect[] = []
  private dateCards: Prospect[] = []

  private currentMatchingUser: string | null = null
  private matchingUsers: UsersPropsCollection = {}
  private unsubscribeUsers: UsersUnsubscribeCollection = {}

  isDateNight = false

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
    if (!this.matchingUsers[this.currentMatchingUser]) return null
    return this.matchingUsers[this.currentMatchingUser].user
  }

  get currentDate(): UsersDate | null {
    if (!this.currentMatchingUser) return null
    if (!this.matchingUsers[this.currentMatchingUser]) return null
    return this.matchingUsers[this.currentMatchingUser].date
  }

  setDateNight(state: boolean) {
    this.isDateNight = state
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
    if (this.currentDate) {
      db.collection(DATES_COLLECTION)
        .doc(this.currentDate.id)
        .update({ active: false })
      const affiliation = this.currentDate?.dateIsWith ? 'for' : 'with'

      this.canselAllDaes(this.currentDate[affiliation])
    }
  }

  async canselAllDaes(email: string) {
    const dateWithDoc = await db
      .collection(DATES_COLLECTION)
      .where('with', '==', user.email)
      .where('for', '==', email)
      .where('end', '>', time.now())
      .where('active', '==', true)
      .limit(1)
      .get()
    const dateForDoc = await db
      .collection(DATES_COLLECTION)
      .where('with', '==', email)
      .where('for', '==', user.email)
      .where('end', '>', time.now())
      .where('active', '==', true)
      .limit(1)
      .get()
    const DateIds = [
      ...dateWithDoc.docs.map(doc => doc.id),
      ...dateForDoc.docs.map(doc => doc.id)
    ]
    DateIds.forEach(id =>
      db.collection(DATES_COLLECTION).doc(id).update({ active: false })
    )
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
    logger.log(`Reseting currentMatchingUser ${this.currentMatchingUser}`)
    user.setDateWith(null)
    this.currentMatchingUser = null
  }

  setCurrentMatchingUser(email: string) {
    user.setDateWith(email)
    this.currentMatchingUser = email
  }

  deleteMatchingUser(email: string) {
    if (this.unsubscribeUsers[email]) {
      logger.log(`unsubscribed from ${email}`)
      this.unsubscribeUsers[email]()
      delete this.unsubscribeUsers[email]
    }
    delete this.matchingUsers[email]
  }

  unsubscribeFromCurrentUser() {
    if (!this.currentMatchingUserData) return
    const lastUserEmail = this.currentMatchingUserData.email
    if (this.unsubscribeUsers[lastUserEmail]) {
      logger.log(`unsubscribed from ${lastUserEmail}`)
      this.unsubscribeUsers[lastUserEmail]()
      delete this.unsubscribeUsers[lastUserEmail]
      logger.log(
        'unsubscribeUsers object',
        JSON.parse(JSON.stringify(this.unsubscribeUsers))
      )
    }
    delete this.matchingUsers[lastUserEmail]
    this.resetCurrentMatchingUser()
  }

  async checkAvailability(callback: Function) {
    if (!this.isDateNight) return
    if (!Object.entries(this.matchingUsers).length) return
    logger.log('Checking for avability...')
    const logGroup = new LogGroup('Current user avability', logger)
    logGroup.add(`free: ${user.free}`, `here: ${user.here}`)
    logGroup.apply()
    if (!user.free) return
    if (!user.here) return
    // logger.startGroup('With users availability')
    const usersLogGroup = new LogGroup('With users availability', logger)
    for (const [email, userProps] of Object.entries(this.matchingUsers)) {
      const matchingUserRef = db.collection(USERS_COLLECTION).doc(email)
      const dateRef = db.collection(DATES_COLLECTION).doc(userProps.date.id)
      const specificUserLogGroup = new LogGroup(`User ${email}`, logger)

      const result = await db.runTransaction(async t => {
        const matchingUserDoc = await t.get(matchingUserRef)
        const dateDoc = await t.get(dateRef)
        const matchingUser = matchingUserDoc.data()
        const date = dateDoc.data()
        if (!date) return false
        if (!matchingUser) return false
        const dateNotCurrentAndActive =
          date.end.seconds < time.now().seconds || !date.active
        specificUserLogGroup.add(
          `Date is current and active: ${!dateNotCurrentAndActive}`,
          `here: ${matchingUser.here}`,
          `free: ${matchingUser.free}`,
          `Having date with current user ${
            matchingUser.dateWith && matchingUser.dateWith === user.email
          }`
        )

        if (dateNotCurrentAndActive) {
          this.deleteMatchingUser(email)
          return false
        }
        if (!matchingUser.here) return false
        if (
          !matchingUser.free &&
          matchingUser.dateWith &&
          matchingUser.dateWith !== user.email
        )
          return false
        if (matchingUser.dateWith && matchingUser.dateWith !== user.email)
          return false
        return true
      })
      specificUserLogGroup.add(`Ability result: ${result}`)
      usersLogGroup.add(() => specificUserLogGroup.apply())

      if (!result) continue
      if (this.currentMatchingUser) continue

      this.setCurrentMatchingUser(email)

      const currentDate = await this.checkDoubleDates(email)
      logger.log('Current Date', currentDate)
      if (!currentDate) {
        this.resetCurrentMatchingUser()
        continue
      }
      this.matchingUsers[email].date = currentDate as UsersDate
      callback()
      break
    }
    usersLogGroup.apply()
  }

  async checkDoubleDates(email: string) {
    const dateWithDoc = await db
      .collection(DATES_COLLECTION)
      .where('with', '==', user.email)
      .where('for', '==', email)
      .where('end', '>', time.now())
      .where('active', '==', true)
      .limit(1)
      .get()
    const dateForDoc = await db
      .collection(DATES_COLLECTION)
      .where('with', '==', email)
      .where('for', '==', user.email)
      .where('end', '>', time.now())
      .where('active', '==', true)
      .limit(1)
      .get()
    const dateWith = dateWithDoc.docs[0] ? dateWithDoc.docs[0] : null
    const dateFor = dateForDoc.docs[0] ? dateForDoc.docs[0] : null
    if (!dateWith || !dateFor) {
      if (dateWith) return dateWith.data()
      if (dateFor) return dateFor.data()
    }
    if (
      dateWith?.data().timeSent.toMillis() < dateFor?.data().timeSent.toMillis()
    )
      return dateWith?.data()
    else return dateFor?.data()
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

  async createDate(forUser: string) {
    logger.log(`Creating date for ${forUser}...`)
    const room = await ConferenceService.makeConferenceRoom()
    const { roomUrl, start, end } = room
    logger.log('Pushing date...')
    const forUserDoc = await db.collection(USERS_COLLECTION).doc(forUser).get()
    if (!forUserDoc.data())
      throw new Error(`User with email ${forUser} doesn't exist'`)
    const dateWithDoc = await db
      .collection(DATES_COLLECTION)
      .where('with', '==', user.email)
      .where('for', '==', forUser)
      .where('end', '>', time.now())
      .where('active', '==', true)
      .get()
    const dateForDoc = await db
      .collection(DATES_COLLECTION)
      .where('with', '==', forUser)
      .where('for', '==', user.email)
      .where('end', '>', time.now())
      .where('active', '==', true)
      .get()

    if (dateWithDoc.docs.length > 0)
      throw new Error(`Active date with ${forUser} already exists!`)
    if (dateForDoc.docs.length > 0)
      throw new Error(`Active date for ${forUser} already exists!`)

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

  async shiftProspects(reject = false) {
    if (!user.email) return
    if (reject) await moveProspectTo('prospects', 'nexts', user.email)
    else {
      try {
        const forUser = await moveProspectTo('prospects', 'likes', user.email)
        if (!forUser) throw new Error('Failed to get forUser!')
        await this.createDate(forUser)
      } catch (err) {
        logger.warn(`Failed to create date!`, err)
      }
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
      user.setHere(true)
      await moveProspectTo('prospects', 'likes', user.email)
      const anotherDate = await db
        .collection(DATES_COLLECTION)
        .where('with', '==', user.email)
        .where('for', '==', this.dateCards[0].email)
        .where('end', '>', time.now())
        .where('active', '==', true)
        .get()

      if (anotherDate.docs.length > 0) {
        logger.log('Found similar date', anotherDate.docs)
        anotherDate.docs.forEach(date =>
          db.collection(DATES_COLLECTION).doc(date.id).set({ active: false })
        )
      }

      await db
        .collection(DATES_COLLECTION)
        .doc(this.dateCards[0].dateId)
        .update({ accepted: true, active: true, timeReplied: time.now() })
    }
  }

  async getRoom(): Promise<Room | null> {
    if (!this.currentDate) return null
    logger.log('Current getting room Date Id', this.currentDate.id)
    const date = this.currentDate
    const room = date.room
    if (!user.name) return null
    const token = await ConferenceService.getToken({ user_name: user.name })
    return {
      url: room,
      token
    } as Room
  }

  subscribeOnUser(email: string, date: UsersDate) {
    logger.log(`subscribe on ${email}`)
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
      if (!dateDoc) return logger.error(`dateDoc with email ${email} not found`)
      const date = dateDocToUsersDate(dateDoc, isWith)
      if (!this.unsubscribeUsers[email])
        this.unsubscribeUsers[email] = this.subscribeOnUser(email, date)
    })
  }

  async checkDatesActive() {
    const checkedDates = []
    for (const card of this.dateCards) {
      const dateDoc = await db
        .collection(DATES_COLLECTION)
        .doc(card.dateId)
        .get()
      const date = dateDoc.data()
      if (
        date?.active &&
        !date?.accepted &&
        date?.end.seconds > time.now().seconds
      )
        checkedDates.push(card)
    }
    logger.log('Active Date cards', checkedDates)
    this.setDateCards(checkedDates)
  }

  subscribeOnDates() {
    const onDate = async (queryDates: QuerySnapshot, isWith: boolean) => {
      if (!this.isDateNight) return
      if (!user.email) return
      // logger.log('Fetched Dates collection update')
      let dates = queryDates.docs.filter(byActive)
      const dateCards = await computeDateCards(dates, user.email)
      dates = dates.filter(byAccepted(true))
      if (dates.length) logger.log('Available dates', dates.map(computeData))
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
          logger.error('Something wrong with prospects Array!')
        }
      }
      if (prospects) this.setProspects(prospects)
    }
    if (!user.email) return

    db.collection(PROSPECTS_COLLECTION).doc(user.email).onSnapshot(onProspects)
  }
}

export default new Meetup()
