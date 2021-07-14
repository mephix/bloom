import { isPlatform } from '@ionic/react'
import { FirebaseService } from 'firebaseService'
// import { PushNotifications } from '@capacitor/push-notifications'
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic'

export class NotificationService {
  static async getToken(): Promise<null | string> {
    try {
      if (isPlatform('hybrid')) {
        alert('register')
        const token = await FCM.getToken()
        alert(token)
        return token
        // const result = await PushNotifications.requestPermissions()

        // alert('adding reg listener')

        // PushNotifications.addListener('registration', token => {
        //   alert(token.value)
        //   // Promise.resolve(token.value)
        // })
        // if (result.receive === 'granted') {
        //   alert(`register ${result.receive}`)

        //   await PushNotifications.register().catch(err =>
        //     alert(JSON.stringify(err, null, 2))
        //   )
        // } else return null
      } else {
        return await FirebaseService.messaging().getToken()
      }
    } catch (err) {
      alert(JSON.stringify(err, null, 2))
      return null
    }
  }

  static onMessage(callback: (nextOrObserver?: any) => void): () => void {
    if (isPlatform('hybrid')) {
      alert('subscribe on message')
      // PushNotifications.addListener(
      //   'pushNotificationReceived',
      //   notification => {
      //     alert('Push received: ' + JSON.stringify(notification))
      //   }
      // )
      // return () => PushNotifications.removeAllListeners()
      return () => {}
    } else {
      return FirebaseService.messaging().onMessage(callback)
    }
  }
}
