import {
  DATES_COLLECTION,
  db,
  DocumentReference,
  DocumentSnapshot,
  LIKES_COLLECTION,
  NEXTS_COLLECTION,
  PROSPECTS_COLLECTION,
  QueryDocumentSnapshot,
  QuerySnapshot,
  time,
  USERS_COLLECTION
} from '../firebaseService'
import { byAccepted, byFor, Logger } from '../utils'
import user from './user'
import { Prospect, UsersDate } from './utils/types'

export const logger = new Logger('Meetup', '#10c744')

export type CollectionSlug = 'prospects' | 'nexts' | 'likes'
export async function checkProspectsCollection(
  collectionSlug: CollectionSlug,
  id: string | undefined
): Promise<DocumentReference> {
  const collection = getCollectionBySlug(collectionSlug)
  const userProspectsRef = db.collection(collection).doc(id)
  const userProspects = await userProspectsRef.get()
  if (!userProspects.data()) {
    userProspectsRef.set({ [collectionSlug]: [] })
  }
  return userProspectsRef
}

export function getCollectionBySlug(slug: CollectionSlug) {
  switch (slug) {
    case 'prospects':
      return PROSPECTS_COLLECTION
    case 'nexts':
      return NEXTS_COLLECTION
    case 'likes':
      return LIKES_COLLECTION
  }
}

export async function moveProspectTo(
  from: CollectionSlug,
  to: CollectionSlug,
  id: string | undefined
): Promise<string | void> {
  const collectionFromRef = await checkProspectsCollection(from, id)
  const collectionToRef = await checkProspectsCollection(to, id)
  const fromUsers = (await collectionFromRef.get()).data()?.[from]
  if (!fromUsers.length) return
  let toUsers = (await collectionToRef.get()).data()?.[to]
  const cutUser = fromUsers.shift() as DocumentReference
  if (!cutUser) return
  toUsers = toUsers && toUsers.length ? toUsers : []
  await collectionFromRef.update({ [from]: [...fromUsers] })
  await collectionToRef.update({ [to]: [cutUser, ...toUsers] })
  const cutUserId = cutUser.id
  return cutUserId as string
}

export async function computeDateCards(dates: DocumentSnapshot[], id: string) {
  const computedDataDates = dates.filter(byAccepted(false)).filter(byFor(id))
  const cards: Prospect[] = []
  for (const date of computedDataDates) {
    const userDoc = await db
      .collection(USERS_COLLECTION)
      .doc(date.data()?.with)
      .get()
    const user = userDoc.data()
    if (!user) continue

    cards.push({
      firstName: user.firstName,
      bio: user.bio,
      userId: userDoc.id,
      avatar: user.avatar,
      dateId: date.id
    })
  }
  return cards
}

const PROSPECTS_LIMIT = 3

export async function getProspectUsersFromRefs(
  prospects: any[]
): Promise<Prospect[]> {
  const prospectsFetchLimit =
    prospects.length >= PROSPECTS_LIMIT ? PROSPECTS_LIMIT : prospects.length
  for (let i = 0; i < prospectsFetchLimit; i++) {
    try {
      prospects[i] = (await prospects[i].get()).data()
    } catch {
      logger.error('Something wrong with prospects Array!')
    }
  }
  return prospects
}

export const dateDocToUsersDate = (
  dateDoc: QueryDocumentSnapshot,
  isWith: boolean
): UsersDate => ({
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
})

export function subscribeOnAllDates(
  callback: (snapshot: QuerySnapshot, isWith: boolean) => void
) {
  const forUnsubscribe = db
    .collection(DATES_COLLECTION)
    .where('for', '==', user.id)
    .where('end', '>', time.now())
    .onSnapshot(d => callback(d, false))
  const withUnsubscribe = db
    .collection(DATES_COLLECTION)
    .where('with', '==', user.id)
    .where('end', '>', time.now())
    .onSnapshot(d => callback(d, true))
  return () => {
    forUnsubscribe()
    withUnsubscribe()
  }
}

export async function checkDateCardsActive(dateCards: Prospect[]) {
  const checkedDates = []
  for (const card of dateCards) {
    const dateDoc = await db.collection(DATES_COLLECTION).doc(card.dateId).get()
    const date = dateDoc.data()
    if (
      date?.active &&
      !date?.accepted &&
      date?.end.seconds > time.now().seconds
    )
      checkedDates.push(card)
  }
  return checkedDates
}

export const mapDatesByWith =
  (isWith: boolean) => (date: QueryDocumentSnapshot) =>
    isWith ? date.data().for : date.data().with
