import { FirebaseService } from 'firebaseService'
import { DATES_COLLECTION } from 'firebaseService/constants'
import { DateTime } from 'luxon'
import { PhoneNumberService } from 'services/phone.number.service'
import { UserService } from 'services/user.service'
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
    const dateRef = FirebaseService.db.collection(DATES_COLLECTION).doc(dateId)
    const dateDoc = await dateRef.get()
    const date = dateDoc.data()!

    const affiliation = date.for === UserService.id ? 'for' : 'with'
    const otherAffiliation = affiliation === 'for' ? 'with' : 'for'
    const rate = date.rate

    await dateRef.update({
      rate: { ...rate, [affiliation]: { ...rate[affiliation], heart: true } }
    })
    await PhoneNumberService.allowMyPhoneNumber(date[otherAffiliation])
  }

  static async blockDate(dateId: string) {
    await FirebaseService.db
      .collection(DATES_COLLECTION)
      .doc(dateId)
      .update({ blocked: true })
  }
}
