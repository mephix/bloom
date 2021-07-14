import * as functions from 'firebase-functions'
import {
  DATES_COLLECTION,
  doc,
  FirebaseService,
  PHONE_NUMBERS_COLLECTION,
  PROSPECTS_COLLECTION,
  USERS_COLLECTION,
  USER_EVENTS_COLLECTION,
  USER_STATUSES_COLLECTION
} from './firebaseService'
import { ConferenceService } from './services/conference.service'
import { MeetupService } from './services/meetup.service'
import { UserCard } from './services/meetup.service/types'
import {
  getMatchType,
  mapCardByRef,
  PROSPECTS_LIMIT
} from './services/meetup.service/utils'
import { UserService } from './services/user.service'

export const onProspectsUpdate = functions.firestore
  .document(doc(PROSPECTS_COLLECTION))
  .onUpdate(async snapshot => {
    console.log('updated prospects for id', snapshot.after.id)

    const eventsDoc = await FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(snapshot.after.id)
      .get()
    const prospects = eventsDoc.data()?.prospects
    if (!prospects) return console.log('no prospects')
    if (prospects.length >= PROSPECTS_LIMIT) return console.log('length higher')
    console.log('updating...')
    await MeetupService.updateUserProspects(snapshot.after.id)
  })

export const onDateWrite = functions.firestore
  .document(doc(DATES_COLLECTION))
  .onWrite(async snapshot => {
    const dateDoc = await snapshot.after
    const date = snapshot.after.data()
    if (!date) return console.log('finished with no date')
    await MeetupService.addDateMatch(dateDoc.id, date)
    console.log(date.end, FirebaseService.time.now())
    const dateNotCurrent = date.end.seconds < FirebaseService.time.now().seconds

    const dateNotCurrentAndActive = dateNotCurrent || !date.active
    if (dateNotCurrentAndActive)
      return console.log('finished with dateNotCurrentAndActive')
    if (!date.accepted) return MeetupService.addDateCard(dateDoc.id, date)
    const forUserStatusRef = MeetupService.getUserStatusRef(date.for)
    const withUserStatusRef = MeetupService.getUserStatusRef(date.with)
    const forUser = await UserService.getUserById(date.for)
    const withUser = await UserService.getUserById(date.with)
    if (!forUser || !withUser) return
    let roomUrl = date.roomUrl
    if (!roomUrl) {
      roomUrl = await ConferenceService.makeConferenceRoom(date.start, date.end)
      await dateDoc.ref.update({ roomUrl })
    }

    const forToken = await ConferenceService.getToken(forUser.firstName)
    const withToken = await ConferenceService.getToken(withUser.firstName)

    const result = await FirebaseService.db.runTransaction(
      async statusTransaction => {
        const forUserStatusDoc = await statusTransaction.get(forUserStatusRef)
        const withUserStatusDoc = await statusTransaction.get(withUserStatusRef)
        const forUserStatus = forUserStatusDoc.data()
        const withUserStatus = withUserStatusDoc.data()
        console.log(forUserStatus)
        console.log(withUserStatus)
        if (
          !forUserStatus ||
          !forUserStatus.here ||
          !forUserStatus.free ||
          !withUserStatus ||
          !withUserStatus.here ||
          !withUserStatus.free
        )
          return false
        else return true
      }
    )
    if (!result) return console.log('finished with result is false')

    const batch = FirebaseService.db.batch()
    const forUserEventsRef = FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(forUser.id)
    const withUserEventsRef = FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(withUser.id)

    // todo: refactor
    batch.update(forUserEventsRef, {
      date: MeetupService.mapUserToDate(
        dateDoc.id,
        withUser,
        roomUrl,
        forToken,
        date.end.seconds,
        date.start.seconds
      )
    })
    batch.update(withUserEventsRef, {
      date: MeetupService.mapUserToDate(
        dateDoc.id,
        forUser,
        roomUrl,
        withToken,
        date.end.seconds,
        date.start.seconds
      )
    })
    await batch.commit()
  })

export const acceptDate = functions.https.onCall(
  async ({ dateId, choice }, context) => {
    const userId = context.auth?.uid
    if (!userId) return
    const events = await FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(userId)
      .get()
    let eventProspects = events.data()?.prospects
    if (!eventProspects) return
    eventProspects = eventProspects.filter(
      (card: UserCard) => card.dateId !== dateId
    )
    await FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(userId)
      .update({ prospects: eventProspects })
    FirebaseService.db.collection(DATES_COLLECTION).doc(dateId).update({
      accepted: choice,
      active: choice,
      timeReplied: FirebaseService.time.now()
    })
  }
)

export const blockMatch = functions.https.onCall(async (dateId, context) => {
  const userId = context.auth?.uid
  if (!userId) return
  const dateRef = FirebaseService.db.collection(DATES_COLLECTION).doc(dateId)
  const dateDoc = await dateRef.get()
  const date = dateDoc.data()
  if (!date) return console.error('no date!')
  const affiliation = date.for === userId ? 'for' : 'with'
  await dateRef.update({ blocked: true, blockedBy: affiliation })
  await MeetupService.deleteMatchForUsers(dateId, date.with, date.for)
})

export const allowPhoneNumber = functions.https.onCall(
  async (otherUser, context) => {
    const userId = context.auth?.uid
    if (!userId) return
    const phoneNumber = (await FirebaseService.auth.getUser(userId))
      .phoneNumber!
    UserService.allowMyPhoneNumber(userId, phoneNumber, otherUser)
  }
)

export const requestPhoneNumber = functions.https.onCall(
  async (userId, context) => {
    try {
      const requesterId = context.auth?.uid!
      const userDoc = await FirebaseService.db
        .collection(USERS_COLLECTION)
        .doc(userId)
        .get()
      const socialMedia = userDoc.data()!.socialMedia
      if (socialMedia) return { type: 'media', data: socialMedia }
      const phoneNumberDoc = await FirebaseService.db
        .collection(PHONE_NUMBERS_COLLECTION)
        .doc(userId)
        .get()
      const phoneNumberData = phoneNumberDoc.data()!
      if (!phoneNumberData.allow.includes(requesterId)) return null

      return { type: 'phone', data: phoneNumberDoc.data()!.phone }
    } catch (err) {
      console.error(err)
      return null
    }
  }
)

export const heartMatch = functions.https.onCall(async (dateId, context) => {
  const userId = context.auth?.uid
  if (!userId) return
  const phoneNumber = (await FirebaseService.auth.getUser(userId)).phoneNumber!
  if (!userId) return
  const dateRef = FirebaseService.db.collection(DATES_COLLECTION).doc(dateId)
  const dateDoc = await dateRef.get()
  const date = dateDoc.data()
  if (!date) return console.error('no date!')
  const affiliation = date.for === userId ? 'for' : 'with'
  const otherAffiliation = affiliation === 'with' ? 'for' : 'with'
  const rate = date.rate
  await dateRef.update({
    rate: { ...rate, [affiliation]: { ...rate[affiliation], heart: true } }
  })
  console.log(affiliation, otherAffiliation)

  UserService.allowMyPhoneNumber(userId, phoneNumber, date[otherAffiliation])

  const forType = getMatchType(true, date.rate?.[otherAffiliation].heart)
  const withType = getMatchType(date.rate?.[otherAffiliation].heart, true)

  console.log(forType, withType)

  await MeetupService.heartMatchForUsers(
    dateId,
    { id: date.for, type: affiliation === 'for' ? forType : withType },
    { id: date.with, type: affiliation === 'for' ? withType : forType }
  )
})

export const moveProspects = functions.https.onCall(
  async ({ id, matches, createDate }, context): Promise<void> => {
    const userId = context.auth?.uid
    if (!userId) return
    if (matches && createDate) await MeetupService.createDate(id, userId)
    const addUserRef = await MeetupService.moveProspect(
      userId,
      id,
      matches ? 'likes' : 'nexts'
    )
    const events = await FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(userId)
      .get()

    let eventProspects = events.data()?.prospects
    if (!eventProspects) return
    eventProspects = eventProspects.filter(
      (card: UserCard) => card.userId !== id
    )
    if (!addUserRef) {
      await FirebaseService.db
        .collection(USER_EVENTS_COLLECTION)
        .doc(userId)
        .update({ prospects: eventProspects })
      return
    }

    const card = await mapCardByRef(addUserRef)

    eventProspects.push(card)
    await FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(userId)
      .update({ prospects: eventProspects })
  }
)

export const updateProspects = functions.https.onCall(async (_, context) => {
  const userId = context.auth?.uid
  if (!userId) return
  return await MeetupService.updateUserProspects(userId)
})

export const updateMatches = functions.https.onCall(async (_, context) => {
  const userId = context.auth?.uid
  if (!userId) return
  return await MeetupService.updateUserMatches(userId)
})

export const onUserStatusUpdate = functions.firestore
  .document(doc(USER_STATUSES_COLLECTION))
  .onUpdate(async snapshot => {
    const userId = snapshot.after.id
    const status = snapshot.after.data()
    if (!status.here || !status.free) return
    const availableDate = await MeetupService.getFirstAvailableDate(userId)
    console.log('available date', availableDate)
    if (!availableDate) return

    let roomUrl = availableDate.roomUrl
    if (!roomUrl) {
      roomUrl = await ConferenceService.makeConferenceRoom(
        availableDate.start,
        availableDate.end
      )
      await availableDate.ref.update({ roomUrl })
    }

    const forUser = await UserService.getUserById(userId)
    const withUser = await UserService.getUserById(availableDate.userId)
    if (!forUser || !withUser) return

    const forToken = await ConferenceService.getToken(forUser.firstName)
    const withToken = await ConferenceService.getToken(withUser.firstName)

    const batch = FirebaseService.db.batch()
    const forUserEventsRef = FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(userId)
    const withUserEventsRef = FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(availableDate.userId)

    batch.update(forUserEventsRef, {
      date: MeetupService.mapUserToDate(
        availableDate.dateId,
        withUser,
        roomUrl,
        forToken,
        availableDate.end.seconds,
        availableDate.start.seconds
      )
    })
    batch.update(withUserEventsRef, {
      date: MeetupService.mapUserToDate(
        availableDate.dateId,
        forUser,
        roomUrl,
        withToken,
        availableDate.end.seconds,
        availableDate.start.seconds
      )
    })
    await batch.commit()
  })

export const checkDateRelevance = functions.https.onCall(async dateId => {
  const date = await MeetupService.getDateById(dateId)
  if (!date) return false
  const usersAvailable = await MeetupService.checkDateUsersAbility(
    date.for,
    date.with
  )
  const dateNotCurrentAndActive =
    date.end.seconds < FirebaseService.time.now().seconds ||
    !date.active ||
    !date.accepted
  if (dateNotCurrentAndActive) {
    MeetupService.resetDate(dateId)
    return false
  }
  if (!usersAvailable) {
    const userForRef = await FirebaseService.db
      .collection(USER_STATUSES_COLLECTION)
      .doc(date.for)
    const userWithRef = await FirebaseService.db
      .collection(USER_STATUSES_COLLECTION)
      .doc(date.with)
    const userForEventsRef = await FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(date.for)
    const userWithEventsRef = await FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(date.with)
    const result = await FirebaseService.db.runTransaction(
      async avabilityTransaction => {
        const userForStatusDoc = await avabilityTransaction.get(userForRef)
        const userWithStatusDoc = await avabilityTransaction.get(userWithRef)
        const forStatus = userForStatusDoc.data()
        const withStatus = userWithStatusDoc.data()
        if (forStatus?.here && withStatus?.here) return false
        avabilityTransaction.update(userForEventsRef, { date: null })
        avabilityTransaction.update(userWithEventsRef, { date: null })
        return true
      }
    )
    if (result) return false
  }

  return true
})

export const updateDateField = functions.https.onCall(
  async ({ dateId, field, data = null }, context) => {
    const userId = context.auth?.uid
    const dateRef = FirebaseService.db.collection(DATES_COLLECTION).doc(dateId)
    await FirebaseService.db.runTransaction(async dateUpdateTransaction => {
      const dateDoc = await dateUpdateTransaction.get(dateRef)
      const date = dateDoc.data()
      if (!date) return
      const affiliation = date.for === userId ? 'for' : 'with'
      dateUpdateTransaction.update(dateRef, {
        [field]: {
          ...date[field],
          [affiliation]: !data ? FirebaseService.time.now() : data
        }
      })
    })
  }
)

export const deactivateDate = functions.https.onCall(async dateId => {
  await FirebaseService.db
    .collection(DATES_COLLECTION)
    .doc(dateId)
    .update({ active: false })
})
