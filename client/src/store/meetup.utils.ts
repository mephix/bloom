import {
  db,
  DocumentReference,
  DocumentSnapshot,
  LIKES_COLLECTION,
  NEXTS_COLLECTION,
  PROSPECTS_COLLECTION,
  QueryDocumentSnapshot,
  USERS_COLLECTION
} from '../firebase'
import { byAccepted, byFor } from '../utils'
import { Prospect, UsersDate } from './utils/types'

export type CollectionSlug = 'prospects' | 'nexts' | 'likes'
export async function checkProspectsCollection(
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
  email: string | undefined
): Promise<string | void> {
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
  return cutUserEmail as string
}

export async function computeDateCards(
  dates: DocumentSnapshot[],
  email: string
) {
  const computedDataDates = dates.filter(byAccepted(false)).filter(byFor(email))
  const cards: Prospect[] = []
  for (const date of computedDataDates) {
    const userGet = await db
      .collection(USERS_COLLECTION)
      .doc(date.data()?.with)
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
