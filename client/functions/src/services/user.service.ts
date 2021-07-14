import {
  FirebaseService,
  PHONE_NUMBERS_COLLECTION,
  USERS_COLLECTION,
  USER_EVENTS_COLLECTION,
  USER_STATUSES_COLLECTION
} from '../firebaseService'
import { userConverter } from '../firebaseService/converters'

export class UserService {
  static async getUserEventsRef(id: string) {
    const eventsRef = FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(id)
    const eventsDoc = await eventsRef.get()
    if (!eventsDoc.data()) this.setupEvents(id)
    return { events: eventsDoc.data()!, eventsRef: eventsRef }
  }

  static async setupStatus(id: string) {
    await FirebaseService.db.collection(USER_STATUSES_COLLECTION).doc(id).set({
      here: false,
      free: true,
      finished: false
    })
  }

  static async setupEvents(id: string) {
    await FirebaseService.db.collection(USER_EVENTS_COLLECTION).doc(id).set({
      date: null,
      matches: [],
      prospects: []
    })
  }

  static async getUserById(id: string) {
    const doc = await FirebaseService.db
      .collection(USERS_COLLECTION)
      .withConverter(userConverter)
      .doc(id)
      .get()
    return doc.data()
  }

  static async allowMyPhoneNumber(
    userId: string,
    phoneNumber: string,
    to: string
  ) {
    try {
      const phoneNumberObjectRef = FirebaseService.db
        .collection(PHONE_NUMBERS_COLLECTION)
        .doc(userId)
      const phoneNumberObjectDoc = await phoneNumberObjectRef.get()
      const phoneNumberObject = phoneNumberObjectDoc.data()
      if (phoneNumberObject) {
        await phoneNumberObjectRef.update({
          allow: [...phoneNumberObject.allow, to]
        })
      } else
        await phoneNumberObjectRef.set({
          phone: phoneNumber,
          allow: [to]
        })
    } catch (err) {
      console.error(err)
      return
    }
  }
}
