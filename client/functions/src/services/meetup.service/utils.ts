import { FirebaseService, USERS_COLLECTION } from '../../firebaseService'
import { CardType, MatchType, UserCard, UserMatch } from './types'

export const PROSPECTS_LIMIT = 3

export async function mapProspectsToCards(
  prospects: FirebaseFirestore.DocumentReference[]
): Promise<UserCard[]> {
  const prospectCards = []
  prospects = prospects.slice(0, PROSPECTS_LIMIT)
  // console.log('pros', prospects)
  for (const userRef of prospects) {
    if (!userRef) continue
    const userDoc = await userRef.get()
    const user = userDoc.data()
    if (!user) continue
    prospectCards.push({
      userId: userDoc.id,
      firstName: user.firstName,
      avatar: user.avatar || '',
      bio: user.bio || '',
      type: CardType.Prospect
    })
  }
  return prospectCards
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
