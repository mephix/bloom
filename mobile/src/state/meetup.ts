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
  UsersUnsubscribeCollection,
  RateToggles
} from './utils/types'
import {
  db,
  time,
  DATES_COLLECTION,
  PROSPECTS_COLLECTION,
  USERS_COLLECTION,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp
} from '../firebaseService'
import user from './user'
import app from './app'
import { ConferenceService } from '../services/conference.service'
import { LogGroup } from '../utils/Logger'
import { byAccepted, byActive, computeData } from '../utils'
import {
  checkDateCardsActive,
  checkProspectsCollection,
  computeDateCards,
  dateDocToUsersDate,
  getProspectUsersFromRefs,
  logger,
  mapDatesByWith,
  moveProspectTo,
  subscribeOnAllDates
} from './meetup.utils'
import { DateClockService, ISO_OPTIONS } from '../services/dateClock.service'
import { DateTime } from 'luxon'
import { PhoneNumberService } from 'services/phoneNumber.service'

class Meetup {
  private prospects: Prospect[] = []
  private prospectsSize: number = 0
  private dateCards: Prospect[] = []

  private currentMatchingUser: string | null = null
  private matchingUsers: UsersPropsCollection = {}
  private unsubscribeUsers: UsersUnsubscribeCollection = {}

  updatingProspects = false
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

  setUpdatingProspects(state: boolean) {
    this.updatingProspects = state
  }

  setDateNight(state: boolean) {
    this.isDateNight = state
  }

  async setRaiting(rate: { [key in RateToggles]: boolean }) {
    if (this.currentMatchingUser) {
      if (rate.heart)
        await PhoneNumberService.allowMyPhoneNumber(this.currentMatchingUser)
    }
    await this.updateCurrentDate('rate', {
      [this.currentAffiliation]: rate
    })
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

  async canselAllDaes(id: string) {
    const dateWithDoc = await db
      .collection(DATES_COLLECTION)
      .where('with', '==', user.id)
      .where('for', '==', id)
      .where('end', '>', time.now())
      .where('active', '==', true)
      .limit(1)
      .get()
    const dateForDoc = await db
      .collection(DATES_COLLECTION)
      .where('with', '==', id)
      .where('for', '==', user.id)
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

  setCurrentMatchingUser(id: string) {
    user.setDateWith(id)
    this.currentMatchingUser = id
  }

  deleteMatchingUser(id: string) {
    if (this.unsubscribeUsers[id]) {
      logger.log(`unsubscribed from ${id}`)
      this.unsubscribeUsers[id]()
      delete this.unsubscribeUsers[id]
    }
    delete this.matchingUsers[id]
  }

  unsubscribeFromCurrentUser() {
    if (!this.currentMatchingUserData) return
    const lastUserId = this.currentMatchingUserData.id
    if (this.unsubscribeUsers[lastUserId]) {
      logger.log(`unsubscribed from ${lastUserId}`)
      this.unsubscribeUsers[lastUserId]()
      delete this.unsubscribeUsers[lastUserId]
      logger.log(
        'unsubscribeUsers object',
        JSON.parse(JSON.stringify(this.unsubscribeUsers))
      )
    }
    delete this.matchingUsers[lastUserId]
    this.resetCurrentMatchingUser()
  }

  checkAvailabilityAfterCountdown() {
    logger.log(
      'Matching user after countdown',
      JSON.stringify(this.currentMatchingUserData)
    )
    if (!this.currentMatchingUserData?.here) return false
    else return true
  }

  // todo: refactor
  /**
   * Checks the availability of all users with whom the date can be
   * @param callback Runs when the availability check was successful
   * @returns void
   */
  async checkAvailability(callback: Function) {
    if (!this.isDateNight) return
    if (!Object.entries(this.matchingUsers).length) return
    logger.log('Checking for avability...')
    const logGroup = new LogGroup('Current user avability', logger)
    logGroup.add(`free: ${user.free}`, `here: ${user.here}`)
    logGroup.apply()
    if (!user.free) return
    if (!user.here || !user.hiddenHere) return
    const usersLogGroup = new LogGroup('With users availability', logger)
    for (const [id, userProps] of Object.entries(this.matchingUsers)) {
      const matchingUserRef = db.collection(USERS_COLLECTION).doc(id)
      const dateRef = db.collection(DATES_COLLECTION).doc(userProps.date.id)
      const specificUserLogGroup = new LogGroup(`User ${id}`, logger)

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
            matchingUser.dateWith && matchingUser.dateWith === user.id
          }`
        )

        if (dateNotCurrentAndActive) {
          this.deleteMatchingUser(id)
          return false
        }
        if (!matchingUser.here) return false
        if (
          !matchingUser.free &&
          matchingUser.dateWith &&
          matchingUser.dateWith !== user.id
        )
          return false
        if (matchingUser.dateWith && matchingUser.dateWith !== user.id)
          return false
        return true
      })
      specificUserLogGroup.add(`Ability result: ${result}`)
      usersLogGroup.add(() => specificUserLogGroup.apply())

      if (!result) continue
      if (this.currentMatchingUser && this.currentMatchingUser !== id) {
        specificUserLogGroup.add(
          `Current matching user already exists ${this.currentMatchingUser}`
        )
        continue
      }
      specificUserLogGroup.add(`Setting up date!`)

      this.setCurrentMatchingUser(id)

      const currentDate = await this.checkDoubleDates(id)
      logger.log('Current Date', currentDate)
      if (!currentDate) {
        this.resetCurrentMatchingUser()
        continue
      }
      this.matchingUsers[id].date = currentDate as UsersDate

      callback()
      break
    }
    usersLogGroup.apply()
  }

  async checkDoubleDates(id: string) {
    const dateWithDoc = await db
      .collection(DATES_COLLECTION)
      .where('with', '==', user.id)
      .where('for', '==', id)
      .where('end', '>', time.now())
      .where('active', '==', true)
      .limit(1)
      .get()
    const dateForDoc = await db
      .collection(DATES_COLLECTION)
      .where('with', '==', id)
      .where('for', '==', user.id)
      .where('end', '>', time.now())
      .where('active', '==', true)
      .limit(1)
      .get()
    const dateWith = dateWithDoc.docs[0] ? dateWithDoc.docs[0] : null
    const dateFor = dateForDoc.docs[0] ? dateForDoc.docs[0] : null
    if (!dateWith || !dateFor) {
      if (dateWith)
        return { ...dateWith.data(), id: dateWith.id, dateIsWith: true }
      if (dateFor)
        return { ...dateFor.data(), id: dateFor.id, dateIsWith: false }
    }
    if (
      dateWith?.data().timeSent.toMillis() < dateFor?.data().timeSent.toMillis()
    )
      return { ...dateWith?.data(), id: dateWith?.id, dateIsWith: true }
    else return { ...dateFor?.data(), id: dateFor?.id, dateIsWith: false }
  }

  async shiftCards(reject = false) {
    if (!user.id) return
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
    // const room = await ConferenceService.makeConferenceRoom()
    const { roundStartTime, roundEndTime } =
      DateClockService.currentRoundStartEnd()
    logger.log('Pushing date...')
    const forUserDoc = await db.collection(USERS_COLLECTION).doc(forUser).get()
    if (!forUserDoc.data())
      throw new Error(`User with id ${forUser} doesn't exist'`)
    const dateWithDoc = await db
      .collection(DATES_COLLECTION)
      .where('with', '==', user.id)
      .where('for', '==', forUser)
      .where('end', '>', time.now())
      .where('active', '==', true)
      .get()
    const dateForDoc = await db
      .collection(DATES_COLLECTION)
      .where('with', '==', forUser)
      .where('for', '==', user.id)
      .where('end', '>', time.now())
      .where('active', '==', true)
      .get()

    if (dateWithDoc.docs.length > 0)
      throw new Error(`Active date with ${forUser} already exists!`)
    if (dateForDoc.docs.length > 0)
      throw new Error(`Active date for ${forUser} already exists!`)

    await db.collection(DATES_COLLECTION).add({
      start: time.fromDate(new Date(roundStartTime)),
      end: time.fromDate(new Date(roundEndTime)),
      for: forUser,
      with: user.id,
      active: true,
      timeSent: time.now()
    })
  }

  async shiftProspects(reject = false) {
    if (!user.id) return
    this.prospects.shift()
    this.prospectsSize--
    if (reject) {
      await moveProspectTo('prospects', 'nexts', user.id)
    } else {
      try {
        const forUser = await moveProspectTo('prospects', 'likes', user.id)
        if (!forUser) throw new Error('Failed to get forUser!')
        await this.createDate(forUser)
      } catch (err) {
        logger.warn(`Failed to create date!`, err)
      }
    }
  }

  async shiftDates(reject = false) {
    if (!user.id) return
    if (reject) {
      await moveProspectTo('prospects', 'nexts', user.id)
      await db
        .collection(DATES_COLLECTION)
        .doc(this.dateCards[0].dateId)
        .update({ accepted: false, active: false, timeReplied: time.now() })
    } else {
      user.setHere(true)
      await moveProspectTo('prospects', 'likes', user.id)
      const anotherDate = await db
        .collection(DATES_COLLECTION)
        .where('with', '==', user.id)
        .where('for', '==', this.dateCards[0].userId)
        .where('end', '>', time.now())
        .where('active', '==', true)
        .get()

      if (anotherDate.docs.length > 0) {
        logger.log('Found similar date', anotherDate.docs)
        anotherDate.docs.forEach(date =>
          db.collection(DATES_COLLECTION).doc(date.id).set({ active: false })
        )
      }
      logger.log('accepting date with id', this.dateCards[0].dateId)

      await db
        .collection(DATES_COLLECTION)
        .doc(this.dateCards[0].dateId)
        .update({ accepted: true, active: true, timeReplied: time.now() })
    }
  }

  async getRoom(): Promise<Room | null> {
    if (!this.currentDate) return null

    logger.log('Current getting room Date', this.currentDate)
    const currentDateRef = db
      .collection(DATES_COLLECTION)
      .doc(this.currentDate.id)
    let room: string | null = null
    while (!room) {
      room = await db.runTransaction(async dateConferenceTransaction => {
        const dateDoc = await dateConferenceTransaction.get(currentDateRef)
        const date = dateDoc.data()
        if (!date) {
          app.setWaitingRoomState()
          return logger.log('No date!')
        }
        const room = date.room
        if (room) return room
        if (date.with !== user.id) return null
        const dateStartTimestamp = date?.start as Timestamp
        const dateEndTimestamp = date?.end as Timestamp

        const dateStartIso = DateTime.fromJSDate(
          dateStartTimestamp.toDate()
        ).toISO(ISO_OPTIONS)
        const dateEndIso = DateTime.fromJSDate(dateEndTimestamp.toDate()).toISO(
          ISO_OPTIONS
        )
        logger.log(`Creating conference room for date ${dateDoc.id}`)
        const roomUrl = await ConferenceService.makeConferenceRoom(
          dateStartIso,
          dateEndIso
        )
        logger.log(`Conference room created ${roomUrl}`)
        await dateConferenceTransaction.update(currentDateRef, {
          room: roomUrl
        })
        return roomUrl
      })
    }
    const token = await ConferenceService.getToken({
      user_name: user.firstName
    })
    return {
      url: room,
      token
    } as Room
  }

  subscribeOnUser(id: string, date: UsersDate) {
    logger.log(`subscribe on ${id}`)
    const onUser = (user: DocumentSnapshot) => {
      const userData = user.data()!
      this.matchingUsers[id] = {
        user: userData as UserData,
        date
      }
      this.checkAvailability(() => app.setVideoState())
    }

    return db.collection(USERS_COLLECTION).doc(id).onSnapshot(onUser)
  }

  checkUsersSubscription(dates: QueryDocumentSnapshot[], isWith: boolean) {
    const usersToSubscribe = dates.map(mapDatesByWith(isWith))
    usersToSubscribe.forEach(id => {
      const dateDoc = dates.find(d => d.data()[isWith ? 'for' : 'with'] === id)
      if (!dateDoc) return logger.error(`dateDoc with id ${id} not found`)
      console.log('isWith while check subs', isWith)
      const date = dateDocToUsersDate(dateDoc, isWith)
      if (!this.unsubscribeUsers[id])
        this.unsubscribeUsers[id] = this.subscribeOnUser(id, date)
    })
  }

  async checkDatesActive() {
    const checkedDates = await checkDateCardsActive(this.dateCards)
    logger.log('Active Date cards', checkedDates)
    this.setDateCards(checkedDates)
  }

  subscribeOnDates() {
    const onDate = async (queryDates: QuerySnapshot, isWith: boolean) => {
      // console.log('hah?', this.isDateNight)
      // if (!this.isDateNight) return
      let dates = queryDates.docs.filter(byActive)
      logger.log(
        'Active dates',
        dates.map(date => date.data())
      )
      const dateCards = await computeDateCards(dates, user.id!)
      dates = dates.filter(byAccepted(true))
      if (dates.length) logger.log('Available dates', dates.map(computeData))
      this.setDateCards(dateCards)
      this.checkUsersSubscription(dates, isWith)
    }

    return subscribeOnAllDates(onDate)
  }

  subscribeOnProspects() {
    const onProspects = async (doc: DocumentSnapshot) => {
      if (this.updatingProspects) return
      this.setUpdatingProspects(true)
      let prospectsData = doc.data()
      if (!prospectsData)
        prospectsData = await checkProspectsCollection('prospects', doc.id)
      const prospects = prospectsData.prospects || []
      if (
        prospects.length === this.prospectsSize &&
        this.prospects.length > 1
      ) {
        this.setUpdatingProspects(false)
        return logger.log('Prospects size is same. Skipping update')
      }
      logger.log('Update prospects')

      this.prospectsSize = prospects.length
      const prospectsUsers = await getProspectUsersFromRefs(prospects || [])
      if (prospectsUsers) this.setProspects(prospectsUsers)
      this.setUpdatingProspects(false)
    }

    return db
      .collection(PROSPECTS_COLLECTION)
      .doc(user.id)
      .onSnapshot(onProspects)
  }
}

export default new Meetup()
