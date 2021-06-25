import { FirebaseService } from 'firebaseService'
import { USERS_COLLECTION } from 'firebaseService/constants'
import { DocumentData, QueryDocumentSnapshot } from 'firebaseService/types'
import { MatchType, UserMatch } from './types'

export async function mapDatesToUsers(
  dateDocs: QueryDocumentSnapshot[],
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

export async function convertDateToUser(
  id: string,
  date: DocumentData,
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
    dateEnd: date.end,
    firstName: user.firstName,
    avatar: user.avatar,
    bio: user.bio,
    userId: userDoc.id,
    type
  }
}

function getMatchType(myMatch: boolean, otherMatch: boolean): MatchType {
  if (myMatch && otherMatch) return 'both'
  else if (myMatch) return 'me'
  else return 'unknown'
}

export const byDesc = (userA: UserMatch, userB: UserMatch) =>
  userB.dateEnd.seconds - userA.dateEnd.seconds
