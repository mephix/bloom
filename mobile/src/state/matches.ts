import {
  DATES_COLLECTION,
  db,
  QueryDocumentSnapshot,
  QuerySnapshot,
  time,
  USERS_COLLECTION,
  DocumentData
} from 'firebaseService'
import { DateTime } from 'luxon'
import { makeAutoObservable } from 'mobx'
import { PhoneNumberService } from 'services/phoneNumber.service'
import { Logger, LogGroup } from 'utils'
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

  async blockDate(dateId: string) {
    await db.collection(DATES_COLLECTION).doc(dateId).update({ blocked: true })
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
      if (this.loading) return
      logger.log('Update matches...')
      const matchesLogGroup = new LogGroup('Updated matches', logger)

      let newMatchesUsers = this.matchesUsers
      for (const dateDoc of dates.docs) {
        const date = dateDoc.data()
        matchesLogGroup.add('Match user date id', dateDoc.id)
        if (date.active) {
          matchesLogGroup.add('Continue: this date is currently active')
          continue
        }
        const currentUserMatch = newMatchesUsers.find(
          match => match.dateId === dateDoc.id
        )
        matchesLogGroup.add('currentUserMatch', currentUserMatch)
        if (date.blocked && currentUserMatch) {
          newMatchesUsers = newMatchesUsers.filter(
            match => match.dateId !== dateDoc.id
          )
          matchesLogGroup.add('Continue(deleting): this date is blocked')
          continue
        }
        if (date.blocked) {
          matchesLogGroup.add('Continue: this date is blocked')
          continue
        }
        const affiliation = isWith ? 'with' : 'for'
        const otherAffiliation = affiliation === 'for' ? 'with' : 'for'

        if (!currentUserMatch) {
          const matchesUser = await convertDateToUser(
            dateDoc.id,
            date,
            affiliation,
            otherAffiliation
          )
          if (!matchesUser) {
            continue
          }
          const matchesUsers = [...newMatchesUsers, matchesUser].sort(byDesc)
          newMatchesUsers = matchesUsers
          matchesLogGroup.add('Continue: created new user')
          continue
        }

        const type = getMatchType(
          date.rate[affiliation].heart,
          date.rate[otherAffiliation].heart
        )
        matchesLogGroup.add('Change type to', type)

        newMatchesUsers = newMatchesUsers.map(user => {
          if (user.dateId === dateDoc.id) return { ...user, type }
          return user
        })
      }
      matchesLogGroup.apply()
      this.setMatchesUsers(newMatchesUsers)
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
    const users = [...usersFor, ...usersWith].sort(byDesc)
    this.setMatchesUsers(users)
    this.setLoading(false)
  }
}

export default new Matches()

const byDesc = (userA: UserMatch, userB: UserMatch) =>
  userB.dateEnd.seconds - userA.dateEnd.seconds

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

async function convertDateToUser(
  id: string,
  date: DocumentData,
  affiliation: string,
  otherAffiliation: string
): Promise<UserMatch | null> {
  if (!date.rate?.[affiliation]) return null
  if (!date.rate?.[otherAffiliation]) return null
  const userDoc = await db
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
