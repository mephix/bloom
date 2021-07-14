import {
  FirebaseService,
  RESTORE_USERS_COLLECTION,
  USERS_COLLECTION
} from '../../firebaseService'
import { userConverter } from '../../firebaseService/converters'
import { CardType, MatchType, UserCard, UserMatch } from './types'

export const PROSPECTS_LIMIT = 3

export async function mapProspectsToCards(
  prospects: FirebaseFirestore.DocumentReference[]
): Promise<UserCard[]> {
  const prospectCards = []
  prospects = prospects.slice(0, PROSPECTS_LIMIT)
  for (const userRef of prospects) {
    if (!userRef) continue

    const card = await mapCardByRef(userRef)
    if (!card) continue
    prospectCards.push(card)
  }
  return prospectCards
}

export async function mapCardByRef(
  ref: FirebaseFirestore.DocumentReference | string
): Promise<UserCard | undefined> {
  if (typeof ref === 'string') {
    const userRecord = await FirebaseService.auth
      .getUserByPhoneNumber(ref)
      .catch(err => console.error(err))
    if (userRecord && userRecord.uid) {
      const userDoc = await FirebaseService.db
        .collection(USERS_COLLECTION)
        .doc(userRecord.uid)
        .withConverter(userConverter)
        .get()
      const user = userDoc.data()
      if (!user) return
      if (!user.avatar) return
      return {
        userId: ref,
        firstName: user.firstName,
        avatar: user.avatar,
        bio: user.bio || '',
        type: CardType.Prospect
      }
    }

    const users = await FirebaseService.db
      .collection(RESTORE_USERS_COLLECTION)
      .withConverter(userConverter)
      .where('phone', '==', ref)
      .limit(1)
      .get()
    const [userDoc] = users.docs
    const user = userDoc.data()
    if (!user) return
    if (!user.avatar) return
    return {
      userId: ref,
      firstName: user.firstName,
      avatar: user.avatar,
      bio: user.bio || '',
      type: CardType.Prospect
    }
  } else {
    const userDoc = await ref.withConverter(userConverter).get()
    const user = userDoc.data()
    if (!user) return
    if (!user.avatar) return
    return {
      userId: user.id,
      firstName: user.firstName,
      avatar: user.avatar,
      bio: user.bio || '',
      type: CardType.Prospect
    }
  }
}

export function getMatchType(myMatch: boolean, otherMatch: boolean): MatchType {
  if (myMatch && otherMatch) return 'both'
  else if (myMatch) return 'me'
  else return 'unknown'
}

export const byDesc = (userA: UserMatch, userB: UserMatch) =>
  userB.dateEnd - userA.dateEnd

export async function convertDateToUser(
  id: string,
  date: FirebaseFirestore.DocumentData,
  affiliation: string,
  otherAffiliation: string
): Promise<UserMatch | null> {
  if (!date.rate?.[affiliation]) return null
  if (!date.rate?.[otherAffiliation]) return null
  const userDoc = await FirebaseService.db
    .collection(USERS_COLLECTION)
    .doc(date[otherAffiliation])
    .get()
  const user = userDoc.data()
  if (!user) return null

  const type = getMatchType(
    date.rate?.[affiliation].heart,
    date.rate?.[otherAffiliation].heart
  )
  return {
    dateId: id,
    dateEnd: date.end.seconds,
    firstName: user.firstName,
    avatar: user.avatar || '',
    bio: user.bio || '',
    userId: userDoc.id,
    type
  }
}

export async function mapDatesToUsers(
  dateDocs: FirebaseFirestore.QueryDocumentSnapshot[],
  affiliation: 'with' | 'for'
) {
  let users: UserMatch[] = []
  const otherAffiliation = affiliation === 'with' ? 'for' : 'with'
  for (const dateDoc of dateDocs) {
    const date = dateDoc.data()
    if (date.blocked) continue
    if (date.active) continue

    const matchesUser = await convertDateToUser(
      dateDoc.id,
      date,
      affiliation,
      otherAffiliation
    )
    if (!matchesUser) continue
    users.push(matchesUser)
  }
  return users
}

export async function checkCollection(
  ref: FirebaseFirestore.DocumentReference,
  name: string
) {
  const collectionDoc = await ref.get()
  if (collectionDoc.data()?.[name]) return
  return await ref.set({ [name]: [] })
}
