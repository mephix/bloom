import { auth, db, PHONE_NUMBERS_COLLECTION } from 'firebaseService'
import user from 'state/user'

export class PhoneNumberService {
  static async getUserPhoneNumber(userId: string) {
    try {
      const phoneNumberDoc = await db
        .collection(PHONE_NUMBERS_COLLECTION)
        .doc(userId)
        .get()
      return phoneNumberDoc.data()!.phone
    } catch (err) {
      return null
    }
  }
  static async allowMyPhoneNumber(userId: string) {
    try {
      const phoneNumberObjectRef = db
        .collection(PHONE_NUMBERS_COLLECTION)
        .doc(user.id)
      const phoneNumberObjectDoc = await phoneNumberObjectRef.get()
      const phoneNumberObject = phoneNumberObjectDoc.data()
      if (phoneNumberObject) {
        await phoneNumberObjectRef.update({
          allow: [...phoneNumberObject.allow, userId]
        })
      } else
        await phoneNumberObjectRef.set({
          phone: auth().currentUser!.phoneNumber,
          allow: [userId]
        })
    } catch (err) {
      console.log('allow Phone Number error', err)
    }
  }
}
