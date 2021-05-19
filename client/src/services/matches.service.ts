import {
  DATES_COLLECTION,
  db,
  DocumentReference,
  MATCHES_COLLECTION,
  time,
  USERS_COLLECTION
} from '../firebase'
import meetup from '../store/meetup'
import user from '../store/user'
import { byAccepted, byActive, Logger } from '../utils'

const EMPTY_MATCHES = {}

type Matches = { [key: string]: number }

const logger = new Logger('Matches', '#d924e3')

export class MatchesService {
  private static email = ''
  private static disabled = false

  static setEmail(email: string) {
    this.email = email
  }
  static setDisabled(state: boolean) {
    this.disabled = state
  }

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
      .where('for', '==', this.email)
      .where('end', '>', time.now())
      .get()
    if (this.disabled) return logger.log('MatchesService disabled!')
    let dates = datesSnapshot.docs.filter(byActive)
    dates = dates.filter(byAccepted(false))
    logger.log(`Number of dates to accept ${dates.length}`)
    for (const date of dates) {
      const email = date.data().with
      const score = await this.getUserMatchScore(email)
      logger.log(email, score)
      if (score > threshold) {
        logger.log(`Accepting date with id ${date.id} for ${email}`)
        const dateRef = db.collection(DATES_COLLECTION).doc(date.id)
        const userRef = db.collection(USERS_COLLECTION).doc(email)
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
          await this.deleteFromMatches(email)
          await this.deleteFromMatchesWith(email)
        }
      }
    }
  }

  private static async deleteFromMatches(email: string) {
    const { matches, ref } = await this.getAllMatches(this.email)
    delete matches[email]
    logger.log(`Deleting ${email} from matches collection`)
    await ref.set({ matches })
  }

  private static async deleteFromMatchesWith(withEmail: string) {
    const { matches, ref } = await this.getAllMatches(withEmail)
    delete matches[this.email]
    logger.log(`Deleting ${this.email} from "with" matches collection`)
    await ref.set({ matches })
  }

  private static async getAllMatches(email: string): Promise<{
    matches: Matches
    ref: DocumentReference
  }> {
    const matchesCollectionRef = db.collection(MATCHES_COLLECTION).doc(email)
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

  private static async getUserMatchScore(email: string): Promise<number> {
    const { matches } = await this.getAllMatches(this.email)
    if (matches[email]) return matches[email]
    else return 1
  }

  private static async getUsersBasedOnThreshold(threshold: number) {
    const { matches } = await this.getAllMatches(this.email)
    return Object.entries(matches).reduce((acc: string[], [email, score]) => {
      if (score > threshold) return [...acc, email]
      return acc
    }, [])
  }
}
