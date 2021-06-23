import * as functions from 'firebase-functions'
import { DATES_DOC, FirebaseService } from './firebaseService'
import * as admin from 'firebase-admin'

// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info('Hello logs!', { structuredData: true })
//   response.send('Hello from Firebase!')
// })

export const createDate = functions.firestore
  .document(DATES_DOC)
  .onCreate(async snapshot => {
    const date = snapshot.data()

    const userId = date.for as string
    const userWithId = date.with as string
    const userRef = FirebaseService.db.collection('Users-dev').doc(userId)
    const userWithRef = FirebaseService.db
      .collection('Users-dev')
      .doc(userWithId)
    const user = await FirebaseService.getDataFromRef(userRef)
    const userWith = await FirebaseService.getDataFromRef(userWithRef)

    if (!user || !userWith || !user.notificationToken || date.accepted) return
    console.log('Push notification for ' + user.firstName)

    const notification = {
      title: 'The Zero Date',
      body: `Do you want a date with ${userWith.firstName}?`
    }
    return admin.messaging().send({
      notification,
      token: user.notificationToken
    })
  })
