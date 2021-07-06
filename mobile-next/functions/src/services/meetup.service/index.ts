import * as dayjs from 'dayjs'
import {
  DATES_COLLECTION,
  FirebaseService,
  LIKES_COLLECTION,
  NEXTS_COLLECTION,
  PROSPECTS_COLLECTION,
  USERS_COLLECTION,
  USER_EVENTS_COLLECTION,
  USER_STATUSES_COLLECTION
} from '../../firebaseService'
import { DateClockService } from '../date.clock.service'
import { UserService } from '../user.service'
import { CardType, UserCard, UserMatch, UserMatchInfo } from './types'
import {
  byDesc,
  checkCollection,
  convertDateToUser,
  mapDatesToUsers,
  mapProspectsToCards,
  PROSPECTS_LIMIT
} from './utils'

export class MeetupService {
  static async getDateById(id: string) {
    const dateDoc = await FirebaseService.db
      .collection(DATES_COLLECTION)
      .doc(id)
      .get()
    return { ...dateDoc.data(), id: dateDoc.id } as any
  }
  static getUserStatusRef(id: string) {
    return FirebaseService.db.collection(USER_STATUSES_COLLECTION).doc(id)
  }

  static async getUserStatusById(id: string) {
    return (
      await FirebaseService.db
        .collection(USER_STATUSES_COLLECTION)
        .doc(id)
        .get()
    ).data()
  }

  static async checkDateUsersAbility(forId: string, withId: string) {
    const forStatus = await this.getUserStatusById(forId)
    const withStatus = await this.getUserStatusById(withId)
    if (!forStatus?.here || !withStatus?.here) return false
    return true
  }

  static async resetDate(dateId: string) {
    const dateDoc = await FirebaseService.db
      .collection(DATES_COLLECTION)
      .doc(dateId)
      .get()
    const date = dateDoc.data()!
    const batch = FirebaseService.db.batch()
    const forUserEventsRef = FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(date.for)
    const withUserEventsRef = FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(date.with)

    batch.update(forUserEventsRef, {
      date: null
    })
    batch.update(withUserEventsRef, {
      date: null
    })
    await batch.commit()
  }

  static async getUserById(id: string) {
    const doc = await FirebaseService.db
      .collection(USERS_COLLECTION)
      .doc(id)
      .get()
    return { ...doc.data()!, id: doc.id } as any
  }

  static async getFirstAvailableDate(userId: string) {
    const dates = await MeetupService.getUserAvailableDates(userId)
    console.log('All dates', dates)
    for (const date of dates) {
      const withStatusDoc = await FirebaseService.db
        .collection(USER_STATUSES_COLLECTION)
        .doc(date.userId)
        .get()
      const withStatus = withStatusDoc.data()
      if (withStatus?.free && withStatus?.here) return date
    }
    return null
  }

  static async getUserAvailableDates(userId: string) {
    const forDates = await FirebaseService.db
      .collection(DATES_COLLECTION)
      .where('for', '==', userId)
      .where('active', '==', true)
      .where('accepted', '==', true)
      .where('end', '>', FirebaseService.time.now())
      .get()
    const withDates = await FirebaseService.db
      .collection(DATES_COLLECTION)
      .where('with', '==', userId)
      .where('active', '==', true)
      .where('accepted', '==', true)
      .where('end', '>', FirebaseService.time.now())
      .get()
    console.log('forDatesLength', forDates.docs.length)
    console.log('withDatesLength', withDates.docs.length)
    const forDatesUsers = forDates.docs.map(dateDoc => ({
      userId: dateDoc.data().with,
      end: dateDoc.data().end,
      start: dateDoc.data().start,
      roomUrl: dateDoc.data().roomUrl,
      ref: dateDoc.ref,
      dateId: dateDoc.id
    }))
    const withDatesUsers = withDates.docs.map(dateDoc => ({
      userId: dateDoc.data().for,
      end: dateDoc.data().end,
      start: dateDoc.data().start,
      roomUrl: dateDoc.data().roomUrl,
      ref: dateDoc.ref,
      dateId: dateDoc.id
    }))

    return [...forDatesUsers, ...withDatesUsers].sort(
      (a, b) => a.end.seconds - b.end.seconds
    )
  }

  static async createDate(forId: string, withId: string) {
    console.log('creatingDate......')
    const { roundStartTime, roundEndTime } =
      await DateClockService.currentRoundStartEnd()
    await FirebaseService.db.collection(DATES_COLLECTION).add({
      start: FirebaseService.time.fromDate(new Date(roundStartTime)),
      end: FirebaseService.time.fromDate(new Date(roundEndTime)),
      for: forId,
      with: withId,
      active: true,
      timeSent: FirebaseService.time.now()
    })
  }

  static async addDateCard(dateId: string, date: any) {
    const withUser = await MeetupService.getUserById(date.with)
    const card = {
      userId: withUser.id,
      firstName: withUser.firstName,
      avatar: withUser.avatar || '',
      bio: withUser.bio || '',
      type: CardType.Date,
      dateId
    }

    const eventsRef = await FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(date.for)
    const events = await eventsRef.get()
    let eventProspects = events.data()?.prospects
    if (!eventProspects) return
    eventsRef.update({ prospects: [card, ...eventProspects] })
  }

  static async getMatches(userId: string): Promise<UserMatch[]> {
    const twentyDaysAgo = dayjs().subtract(20, 'days').toDate()
    console.log('Fetching matches')
    const dateForDocs = await FirebaseService.db
      .collection(DATES_COLLECTION)
      .where('for', '==', userId)
      .where('end', '>', FirebaseService.time.fromDate(twentyDaysAgo))
      .get()
    const dateWithDocs = await FirebaseService.db
      .collection(DATES_COLLECTION)
      .where('with', '==', userId)
      .where('end', '>', FirebaseService.time.fromDate(twentyDaysAgo))
      .get()
    const usersFor = await mapDatesToUsers(dateForDocs.docs, 'for')
    const usersWith = await mapDatesToUsers(dateWithDocs.docs, 'with')
    const users = [...usersFor, ...usersWith].sort(byDesc)
    return users
  }

  static async addDateMatch(
    dateId: string,
    date: FirebaseFirestore.DocumentData
  ) {
    if (date.blocked) return
    if (date.active) return
    const { events: forEvents, eventsRef: forEventsRef } =
      await UserService.getUserEventsRef(date.for)
    const { events: withEvents, eventsRef: withEventsRef } =
      await UserService.getUserEventsRef(date.with)
    const forMatch = forEvents.matches.some(
      (match: UserMatch) => match.dateId === dateId
    )
    if (!forMatch) {
      console.log('adding new match to ', date.for)
      const forUser = await convertDateToUser(dateId, date, 'for', 'with')
      if (forUser) {
        const newForEventMatches = [forUser, ...forEvents.matches].sort(byDesc)
        await forEventsRef.update({ matches: newForEventMatches })
      }
    }
    const withMatch = withEvents.matches.some(
      (match: UserMatch) => match.dateId === dateId
    )
    if (!withMatch) {
      console.log('adding new match to ', date.with)
      const withUser = await convertDateToUser(dateId, date, 'with', 'for')
      if (withUser) {
        const newWithEventMatches = [withUser, ...withEvents.matches].sort(
          byDesc
        )
        await withEventsRef.update({ matches: newWithEventMatches })
      }
    }
  }

  static async initEventProspects(userId: string, prospects: UserCard[]) {
    await FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(userId)
      .update({ prospects })
  }

  static async initEventMatches(userId: string, matches: UserMatch[]) {
    await FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(userId)
      .update({ matches })
  }

  static async getDateCards(userId: string): Promise<UserCard[]> {
    const datesDocs = await FirebaseService.db
      .collection(DATES_COLLECTION)
      .where('for', '==', userId)
      .where('active', '==', true)
      .where('accepted', '==', false)
      .where('end', '>', FirebaseService.time.now())
      .get()
    const dateCards = []
    for (const dateDoc of datesDocs.docs) {
      const date = { id: dateDoc.id, ...dateDoc.data() } as any
      const withUser = await MeetupService.getUserById(date.with)
      dateCards.push({
        userId: withUser.id,
        firstName: withUser.firstName,
        avatar: withUser.avatar || '',
        bio: withUser.bio || '',
        type: CardType.Date,
        dateId: date.id
      })
    }
    return dateCards
  }

  static async moveProspect(
    userId: string,
    prospectId: string,
    to: 'likes' | 'nexts'
  ) {
    const COLLECTION = to === 'likes' ? LIKES_COLLECTION : NEXTS_COLLECTION
    const collectionRef = FirebaseService.db.collection(COLLECTION).doc(userId)
    await checkCollection(collectionRef, to)
    const prospectsRef = FirebaseService.db
      .collection(PROSPECTS_COLLECTION)
      .doc(userId)
    return await FirebaseService.db.runTransaction(
      async moveProspectTransaction => {
        const prospectsDoc = await moveProspectTransaction.get(prospectsRef)
        const collectionDoc = await moveProspectTransaction.get(collectionRef)
        const prospects: FirebaseFirestore.DocumentReference[] =
          prospectsDoc.data()?.prospects || []
        const collection: FirebaseFirestore.DocumentReference[] =
          collectionDoc.data()?.[to] || []
        const newProspects = prospects.filter(
          prospect => prospect.id !== prospectId
        )
        await moveProspectTransaction.update(prospectsRef, {
          prospects: newProspects
        })
        await moveProspectTransaction.update(collectionRef, {
          [to]: [
            ...collection,
            FirebaseService.db.collection(USERS_COLLECTION).doc(prospectId)
          ]
        })

        return newProspects[PROSPECTS_LIMIT - 1]
      }
    )
  }

  static async getProspects(
    userId: string
  ): Promise<FirebaseFirestore.DocumentReference[]> {
    const prospectsRef = FirebaseService.db
      .collection(PROSPECTS_COLLECTION)
      .doc(userId)
    const prospectsDoc = await prospectsRef.get()
    const prospects = prospectsDoc.data()?.prospects
    if (!prospects) {
      prospectsRef.set({ prospects: [] })
      return []
    }
    return prospects
  }

  static async deleteMatchForUsers(
    dateId: string,
    forId: string,
    withId: string
  ) {
    const batch = FirebaseService.db.batch()
    const { events: forEvents, eventsRef: forEventsRef } =
      await UserService.getUserEventsRef(forId)
    const { events: withEvents, eventsRef: withEventsRef } =
      await UserService.getUserEventsRef(withId)
    const forMatches = forEvents?.matches || []
    const withMatches = withEvents?.matches || []
    const newForMatches = forMatches.filter(
      (match: UserMatch) => match.dateId !== dateId
    )
    const newWithMatches = withMatches.filter(
      (match: UserMatch) => match.dateId !== dateId
    )

    batch.update(forEventsRef, { matches: newForMatches })
    batch.update(withEventsRef, { matches: newWithMatches })
    console.log('updating matches for', forId, withId)
    await batch.commit()
  }

  static async heartMatchForUsers(
    dateId: string,
    forInfo: UserMatchInfo,
    withInfo: UserMatchInfo
  ) {
    console.log(forInfo, withInfo)
    const batch = FirebaseService.db.batch()
    const { events: forEvents, eventsRef: forEventsRef } =
      await UserService.getUserEventsRef(forInfo.id)
    const { events: withEvents, eventsRef: withEventsRef } =
      await UserService.getUserEventsRef(withInfo.id)
    const forMatches = forEvents?.matches || []
    const withMatches = withEvents?.matches || []
    const newForMatches = forMatches.map((match: UserMatch) =>
      match.dateId === dateId ? { ...match, type: forInfo.type } : match
    )
    const newWithMatches = withMatches.map((match: UserMatch) =>
      match.dateId === dateId ? { ...match, type: withInfo.type } : match
    )

    batch.update(forEventsRef, { matches: newForMatches })
    batch.update(withEventsRef, { matches: newWithMatches })
    console.log('updating matches for', forInfo.id, withInfo.id)
    await batch.commit()
  }

  static async updateUserProspects(userId: string) {
    const dateCards = await this.getDateCards(userId)
    if (dateCards.length >= 10)
      return this.initEventProspects(userId, dateCards)
    const prospects = await this.getProspects(userId)
    const prospectCards = await mapProspectsToCards(prospects)
    // console.log('updated cards', [...dateCards, ...prospectCards])
    await this.initEventProspects(userId, [...dateCards, ...prospectCards])
  }

  static mapUserToDate(
    dateId: string,
    user: any,
    roomUrl: string,
    token: string,
    end: number
  ) {
    return {
      dateId,
      userId: user.id,
      firstName: user.firstName,
      bio: user.bio,
      avatar: user.avatar,
      roomUrl,
      token,
      end
    }
  }

  static async updateUserMatches(userId: string) {
    const matches = await this.getMatches(userId)
    return await this.initEventMatches(userId, matches)
  }
}
