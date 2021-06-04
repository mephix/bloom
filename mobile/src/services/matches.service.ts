import {
  DATES_COLLECTION,
  db,
  DocumentReference,
  MATCHES_COLLECTION,
  QueryDocumentSnapshot,
  time,
  USERS_COLLECTION
} from 'firebaseService'
import { DateTime } from 'luxon'
import meetup from 'state/meetup'
import user from 'state/user'
import { MatchType, UserMatch } from 'state/utils/types'
import { byAccepted, byActive, Logger } from 'utils'

const EMPTY_MATCHES = {}

type Matches = { [key: string]: number }

const logger = new Logger('Matches', '#d924e3')

export class MatchesService {
  private static disabled = true
  private static matchesUsersCache: UserMatch[] = []
  private static datesCount = 0

  static setDisabled(state: boolean) {
    this.disabled = state
  }

  // static async getLastDateUsers() {
  //   const twentyDaysAgo = DateTime.now().minus({ days: 20 }).toJSDate()
  //   logger.log('Fetching matches')
  //   const dateWithDocs = await db
  //     .collection(DATES_COLLECTION)
  //     .where('with', '==', user.id)
  //     .where('end', '>', time.fromDate(twentyDaysAgo))
  //     .get()
  //   const dateForDocs = await db
  //     .collection(DATES_COLLECTION)
  //     .where('for', '==', user.id)
  //     .where('end', '>', time.fromDate(twentyDaysAgo))
  //     .get()
  //   const datesCount = dateForDocs.docs.length + dateWithDocs.docs.length
  //   if (datesCount === this.datesCount) {
  //     logger.log('Get matches from cache')
  //     return this.matchesUsersCache
  //   }
  //   this.datesCount = datesCount

  //   const usersFor = await mapDatesToUsers(dateWithDocs.docs, 'for')
  //   const usersWith = await mapDatesToUsers(dateForDocs.docs, 'with')
  //   const users = [...usersFor, ...usersWith].sort(
  //     (userA, userB) => userB.dateEnd.seconds - userA.dateEnd.seconds
  //   )
  //   this.matchesUsersCache = users
  //   return users
  // }

  static async inviteAndAcceptMatches(
    threshold: number,
    thresholdWithDelay: number
  ) {
    await this.inviteMatches(threshold)
    await this.acceptMatches(thresholdWithDelay)
  }

  static async inviteMatches(threshold: number) {
    logger.log('Invite matches. Threshold:', threshold)
    const usersToInvite = await this.getUsersBasedOnThreshold(threshold)

    logger.log('usersToInvite:', usersToInvite)
    if (this.disabled) return logger.log('MatchesService disabled!')
    for (const user of usersToInvite) {
      try {
        await meetup.createDate(user)
      } catch (err) {
        logger.error(`Failed to create date!`, err)
      }
    }
  }

  static async acceptMatches(threshold: number) {
    logger.log('Accept Dates. Threshold:', threshold)
    const datesSnapshot = await db
      .collection(DATES_COLLECTION)
      .where('for', '==', user.id)
      .where('end', '>', time.now())
      .get()
    if (this.disabled) return logger.log('MatchesService disabled!')
    let dates = datesSnapshot.docs.filter(byActive)
    dates = dates.filter(byAccepted(false))
    logger.log(`Number of dates to accept ${dates.length}`)
    for (const date of dates) {
      const id = date.data().with
      const score = await this.getUserMatchScore(id)
      logger.log(id, score)
      if (score > threshold) {
        logger.log(`Accepting date with id ${date.id} for ${id}`)
        const dateRef = db.collection(DATES_COLLECTION).doc(date.id)
        const userRef = db.collection(USERS_COLLECTION).doc(id)
        const result = await db.runTransaction(async t => {
          const dateDoc = await t.get(dateRef)
          const userWithDoc = await t.get(userRef)
          const userWith = userWithDoc.data()
          const date = dateDoc.data()
          const dateNotCurrentAndActive =
            date?.end.seconds < time.now().seconds || !date?.active
          if (!userWith?.here || !userWith?.free) return false
          if (!user.here || !user.free) return false
          if (dateNotCurrentAndActive) return false
          await t.update(dateRef, { accepted: true, timeReplied: time.now() })
          return true
        })
        if (result) {
          await this.deleteFromMatches(id)
          await this.deleteFromMatchesWith(id)
        }
      }
    }
  }

  private static async deleteFromMatches(id: string) {
    const { matches, ref } = await this.getAllMatches(user.id!)
    delete matches[id]
    logger.log(`Deleting ${id} from matches collection`)
    await ref.set({ matches })
  }

  private static async deleteFromMatchesWith(withId: string) {
    const { matches, ref } = await this.getAllMatches(withId)
    delete matches[user.id!]
    logger.log(`Deleting ${user.id!} from "with" matches collection`)
    await ref.set({ matches })
  }

  private static async getAllMatches(id: string): Promise<{
    matches: Matches
    ref: DocumentReference
  }> {
    const matchesCollectionRef = db.collection(MATCHES_COLLECTION).doc(id)
    const matchesCollectionDoc = await matchesCollectionRef.get()
    const matchesCollection = matchesCollectionDoc.data()
    if (!matchesCollection) {
      await matchesCollectionRef.set({ matches: EMPTY_MATCHES })
      return { matches: EMPTY_MATCHES as Matches, ref: matchesCollectionRef }
    }
    if (!matchesCollection.matches) {
      await matchesCollectionRef.set({ matches: EMPTY_MATCHES })
      return { matches: EMPTY_MATCHES as Matches, ref: matchesCollectionRef }
    }
    return {
      matches: matchesCollection.matches as Matches,
      ref: matchesCollectionRef
    }
  }

  private static async getUserMatchScore(id: string): Promise<number> {
    const { matches } = await this.getAllMatches(user.id!)
    if (matches[id]) return matches[id]
    else return 1
  }

  private static async getUsersBasedOnThreshold(threshold: number) {
    const { matches } = await this.getAllMatches(user.id!)
    return Object.entries(matches).reduce((acc: string[], [id, score]) => {
      if (score > threshold) return [...acc, id]
      return acc
    }, [])
  }
}

// export async function mapDatesToUsers(
//   dateDocs: QueryDocumentSnapshot[],
//   affiliation: 'with' | 'for'
// ) {
//   let users: UserMatch[] = []
//   const otherAffiliation = affiliation === 'with' ? 'for' : 'with'
//   for (const dateDoc of dateDocs) {
//     const date = dateDoc.data()
//     if (date.blocked) continue

//     if (!date.rate?.[affiliation]) continue
//     if (!date.rate?.[otherAffiliation]) continue
//     const userDoc = await db
//       .collection(USERS_COLLECTION)
//       .doc(date[affiliation])
//       .get()
//     const user = userDoc.data()
//     if (!user) continue

//     const type = getMatchType(
//       date.rate?.[affiliation].heart,
//       date.rate?.[otherAffiliation].heart
//     )

//     users.push({
//       dateId: dateDoc.id,
//       dateEnd: date.end,
//       firstName: user.firstName,
//       avatar: user.avatar,
//       bio: user.bio,
//       userId: userDoc.id,
//       type
//     })
//   }
//   return users
// }

// function getMatchType(withMatch: boolean, forMatch: boolean): MatchType {
//   if (withMatch && forMatch) return 'both'
//   else if (withMatch) return 'me'
//   else return 'unknown'
// }
