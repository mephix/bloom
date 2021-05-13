import { db, MATCHES_COLLECTION } from '../firebase'
import { Logger } from '../utils'

const EMPTY_MATCHES = {}

type Matches = { [key: string]: number }

const logger = new Logger('Matches', '#d924e3')

export class MatchesService {
  private static email = ''

  static setEmail(email: string) {
    this.email = email
  }

  static async inviteMatches(threshold: number) {
    logger.debug('Invite matches. Threshold:', threshold)
    const usersToInvite = await this.getUsersBasedOnThreshold(threshold)
    logger.debug('usersToInvite:', usersToInvite)
  }

  // static deleteIfExist(email: string) {

  // }

  private static async getAll(): Promise<Matches> {
    const matchesCollectionRef = db
      .collection(MATCHES_COLLECTION)
      .doc(this.email)
    const matchesCollectionDoc = await matchesCollectionRef.get()
    const matchesCollection = matchesCollectionDoc.data()
    if (!matchesCollection) {
      await matchesCollectionRef.set({ matches: EMPTY_MATCHES })
      return EMPTY_MATCHES as Matches
    }
    if (!matchesCollection.matches) {
      await matchesCollectionRef.set({ matches: EMPTY_MATCHES })
      return EMPTY_MATCHES as Matches
    }
    return matchesCollection.matches as Matches
  }

  private static async getUsersBasedOnThreshold(threshold: number) {
    const matches = await this.getAll()
    return Object.entries(matches).reduce((acc: string[], [email, score]) => {
      if (score > threshold) return [...acc, email]
      return acc
    }, [])
  }
}
