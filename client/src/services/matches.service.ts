import { DATES_COLLECTION, db, MATCHES_COLLECTION, time } from '../firebase'
import meetup, { byAccepted, byActive } from '../store/meetup'
import { DocumentReference } from '../store/utils/types'
import { Logger } from '../utils'

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
    logger.debug('Invite matches. Threshold:', threshold)
    const usersToInvite = await this.getUsersBasedOnThreshold(threshold)

    logger.debug('usersToInvite:', usersToInvite)
    if (this.disabled) return logger.debug('MatchesService disabled!')
    for (const user of usersToInvite) {
      try {
        await meetup.createDate(user)
      } catch (err) {
        logger.error(`Failed to create date!`, err)
      }
    }
  }

  static async acceptMatches(threshold: number) {
    logger.debug('Accept Dates. Threshold:', threshold)
    const datesSnapshot = await db
      .collection(DATES_COLLECTION)
      .where('for', '==', this.email)
      .where('end', '>', time.now())
      .get()
    if (this.disabled) return logger.debug('MatchesService disabled!')
    let dates = datesSnapshot.docs.filter(byActive)
    dates = dates.filter(byAccepted(false))
    logger.debug(`Number of dates to accept ${dates.length}`)
    for (const date of dates) {
      const email = date.data().with
      const score = await this.getUserMatchScore(email)
      logger.debug(email, score)
      if (score > threshold) {
        logger.debug(`Accepting date with id ${date.id} for ${email}`)
        await db
          .collection(DATES_COLLECTION)
          .doc(date.id)
          .update({ accepted: true })
        await this.deleteFromMatches(email)
        await this.deleteFromMatchesWith(email)
      }
    }
  }

  private static async deleteFromMatches(email: string) {
    const { matches, ref } = await this.getAllMatches(this.email)
    delete matches[email]
    logger.debug(`Deleting ${email} from matches collection`)
    await ref.set({ matches })
  }

  private static async deleteFromMatchesWith(withEmail: string) {
    const { matches, ref } = await this.getAllMatches(withEmail)
    delete matches[this.email]
    logger.debug(`Deleting ${this.email} from "with" matches collection`)
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
