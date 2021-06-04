import {
  DATES_COLLECTION,
  db,
  QueryDocumentSnapshot,
  QuerySnapshot,
  time,
  USERS_COLLECTION
} from 'firebaseService'
import { DateTime } from 'luxon'
import { makeAutoObservable } from 'mobx'
import { PhoneNumberService } from 'services/phoneNumber.service'
import { Logger } from 'utils'
import user from './user'
import { MatchType, UserMatch } from './utils/types'

const logger = new Logger('Matches', '#cd29ff')

class Matches {
  loading = true
  matchesUsers: UserMatch[] = []

  constructor() {
    makeAutoObservable(this)
  }

  setMatchesUsers(matches: UserMatch[]) {
    this.matchesUsers = matches
  }

  setLoading(state: boolean) {
    this.loading = state
  }

  async setHeart(dateId: string) {
    const dateRef = db.collection(DATES_COLLECTION).doc(dateId)
    const dateDoc = await dateRef.get()
    const date = dateDoc.data()!

    const affiliation = date.for === user.id ? 'for' : 'with'
    const otherAffiliation = affiliation === 'for' ? 'with' : 'for'
    const rate = date.rate

    await dateRef.update({
      rate: { ...rate, [affiliation]: { ...rate[affiliation], heart: true } }
    })
    await PhoneNumberService.allowMyPhoneNumber(date[otherAffiliation])
  }

  subscribeOnMatches() {
    const onMatches = async (dates: QuerySnapshot, isWith: boolean) => {
      if (!this.matchesUsers.length) return
      for (const dateDoc of dates.docs) {
        const date = dateDoc.data()
        if (date.active) continue
        const currentUserMatch = this.matchesUsers.find(
          match => match.dateId === dateDoc.id
        )
        if (!currentUserMatch) continue // todo: add to matches array!
        const affiliation = isWith ? 'with' : 'for'
        const otherAffiliation = affiliation === 'for' ? 'with' : 'for'
        const type = getMatchType(
          date.rate[affiliation].heart,
          date.rate[otherAffiliation].heart
        )
        this.matchesUsers = this.matchesUsers.map(user => {
          if (user.dateId === dateDoc.id) return { ...user, type }
          return user
        })
      }
      // console.log(isWith)
      logger.log('update...')
    }
    const twentyDaysAgo = DateTime.now().minus({ days: 20 }).toJSDate()

    const dateWithUnsubscribe = db
      .collection(DATES_COLLECTION)
      .where('with', '==', user.id)
      .where('end', '>', time.fromDate(twentyDaysAgo))
      .onSnapshot(dates => onMatches(dates, true))
    const dateForUnsubscribe = db
      .collection(DATES_COLLECTION)
      .where('for', '==', user.id)
      .where('end', '>', time.fromDate(twentyDaysAgo))
      .onSnapshot(dates => onMatches(dates, false))

    return () => {
      dateWithUnsubscribe()
      dateForUnsubscribe()
    }
  }

  async fetchLastDateUsers() {
    const twentyDaysAgo = DateTime.now().minus({ days: 20 }).toJSDate()
    logger.log('Fetching matches')
    const dateForDocs = await db
      .collection(DATES_COLLECTION)
      .where('for', '==', user.id)
      .where('end', '>', time.fromDate(twentyDaysAgo))
      .get()
    const dateWithDocs = await db
      .collection(DATES_COLLECTION)
      .where('with', '==', user.id)
      .where('end', '>', time.fromDate(twentyDaysAgo))
      .get()

    const usersFor = await mapDatesToUsers(dateForDocs.docs, 'for')
    const usersWith = await mapDatesToUsers(dateWithDocs.docs, 'with')
    const users = [...usersFor, ...usersWith].sort(
      (userA, userB) => userB.dateEnd.seconds - userA.dateEnd.seconds
    )
    this.setMatchesUsers(users)
    this.setLoading(false)
  }
}

export default new Matches()

export async function mapDatesToUsers(
  dateDocs: QueryDocumentSnapshot[],
  affiliation: 'with' | 'for'
) {
  let users: UserMatch[] = []
  const otherAffiliation = affiliation === 'with' ? 'for' : 'with'
  for (const dateDoc of dateDocs) {
    const date = dateDoc.data()
    if (date.blocked) continue

    if (!date.rate?.[affiliation]) continue
    if (!date.rate?.[otherAffiliation]) continue
    const userDoc = await db
      .collection(USERS_COLLECTION)
      .doc(date[affiliation])
      .get()
    const user = userDoc.data()
    if (!user) continue

    const type = getMatchType(
      date.rate?.[affiliation].heart,
      date.rate?.[otherAffiliation].heart
    )

    users.push({
      dateId: dateDoc.id,
      dateEnd: date.end,
      firstName: user.firstName,
      avatar: user.avatar,
      bio: user.bio,
      userId: userDoc.id,
      type
    })
  }
  return users
}

function getMatchType(myMatch: boolean, otherMatch: boolean): MatchType {
  if (myMatch && otherMatch) return 'both'
  else if (myMatch) return 'me'
  else return 'unknown'
}
