import { FirebaseService } from 'firebaseService'
import { PHONE_NUMBERS_COLLECTION } from 'firebaseService/constants'
import { UserService } from './user.service'
import copy from 'copy-to-clipboard'
import { SMS } from '@ionic-native/sms'
import { isPlatform } from '@ionic/react'

export class PhoneNumberService {
  static interactWithPhoneNumber(number: string) {
    if (isPlatform('hybrid')) {
      alert(number)
      SMS.send(number, 'hello', {
        android: {
          intent: 'INTENT'
        }
      })
    } else {
      copy(number)
    }
  }

  static copy(contact: string) {
    copy(contact)
  }
  static async setupPhoneNumberObject(id: string) {
    const phoneNumberObjectRef = FirebaseService.db
      .collection(PHONE_NUMBERS_COLLECTION)
      .doc(id)
    await phoneNumberObjectRef.set({
      phone: FirebaseService.auth().currentUser!.phoneNumber,
      allow: []
    })
  }
  static async getUserContact(userId: string) {
    try {
      const { data } = await FirebaseService.functions.httpsCallable(
        'requestPhoneNumber'
      )(userId)
      return data
    } catch (err) {
      return null
    }
  }
  static async allowMyPhoneNumber(userId: string) {
    await FirebaseService.functions.httpsCallable('allowPhoneNumber')(userId)
  }
}
