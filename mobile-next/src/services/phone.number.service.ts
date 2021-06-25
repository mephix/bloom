import { FirebaseService } from 'firebaseService'
import { PHONE_NUMBERS_COLLECTION } from 'firebaseService/constants'
import { UserService } from './user.service'

export class PhoneNumberService {
  static async setupPhoneNumberObject(id: string) {
    const phoneNumberObjectRef = FirebaseService.db
      .collection(PHONE_NUMBERS_COLLECTION)
      .doc(id)
    await phoneNumberObjectRef.set({
      phone: FirebaseService.auth().currentUser!.phoneNumber,
      allow: []
    })
  }
  static async getUserPhoneNumber(userId: string) {
    try {
      const phoneNumberDoc = await FirebaseService.db
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
      const phoneNumberObjectRef = FirebaseService.db
        .collection(PHONE_NUMBERS_COLLECTION)
        .doc(UserService.id)
      const phoneNumberObjectDoc = await phoneNumberObjectRef.get()
      const phoneNumberObject = phoneNumberObjectDoc.data()
      if (phoneNumberObject) {
        await phoneNumberObjectRef.update({
          allow: [...phoneNumberObject.allow, userId]
        })
      } else
        await phoneNumberObjectRef.set({
          phone: FirebaseService.auth().currentUser!.phoneNumber,
          allow: [userId]
        })
    } catch (err) {
      console.log('allow Phone Number error', err)
    }
  }
}
