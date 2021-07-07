import { FirebaseService } from 'firebaseService'
import { DATES_COLLECTION } from 'firebaseService/constants'
import { DateTime } from 'luxon'
import { UserService } from 'services/user.service'
import { store } from 'store'
import { blockMatch } from 'store/meetup'
import { UserMatch } from './types'
import { byDesc, mapDatesToUsers } from './utils'

export class MatchesService {
  static async fetchLastMatches(): Promise<UserMatch[]> {
    const twentyDaysAgo = DateTime.now().minus({ days: 20 }).toJSDate()
    const dateForDocs = await FirebaseService.db
      .collection(DATES_COLLECTION)
      .where('for', '==', UserService.id)
      .where('end', '>', FirebaseService.time.fromDate(twentyDaysAgo))
      .get()
    const dateWithDocs = await FirebaseService.db
      .collection(DATES_COLLECTION)
      .where('with', '==', UserService.id)
      .where('end', '>', FirebaseService.time.fromDate(twentyDaysAgo))
      .get()

    const usersFor = await mapDatesToUsers(dateForDocs.docs, 'for')
    const usersWith = await mapDatesToUsers(dateWithDocs.docs, 'with')
    const users = [...usersFor, ...usersWith].sort(byDesc)
    return users
  }

  static async setHeart(dateId: string) {
    // const dateRef = FirebaseService.db.collection(DATES_COLLECTION).doc(dateId)
    // const dateDoc = await dateRef.get()
    // const date = dateDoc.data()!
    // const affiliation = date.for === UserService.id ? 'for' : 'with'
    // const otherAffiliation = affiliation === 'for' ? 'with' : 'for'
    // const rate = date.rate
    // await dateRef.update({
    //   rate: { ...rate, [affiliation]: { ...rate[affiliation], heart: true } }
    // })
    // await PhoneNumberService.allowMyPhoneNumber(date[otherAffiliation])
    await FirebaseService.functions.httpsCallable('heartMatch')(dateId)
  }

  static async blockDate(dateId: string) {
    store.dispatch(blockMatch(dateId))
    await FirebaseService.functions.httpsCallable('blockMatch')(dateId)
  }
}
