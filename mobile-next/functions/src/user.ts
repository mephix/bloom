import * as functions from 'firebase-functions'
import {
  // DATES_COLLECTION,
  // doc,
  FirebaseService,
  RDB_ONLINE_REF,
  USER_EVENTS_COLLECTION,
  USER_STATUSES_COLLECTION
} from './firebaseService'
import { UserService } from './services/user.service'
// import * as admin from 'firebase-admin'

// export const onUserCreate = functions.firestore
//   .document(doc(USERS_COLLECTION))
//   .onCreate(async snapshot => {
//     const date = snapshot.data()

//     const userId = date.for as string
//     const userWithId = date.with as string
//     const userRef = FirebaseService.db.collection('Users-dev').doc(userId)
//     const userWithRef = FirebaseService.db
//       .collection('Users-dev')
//       .doc(userWithId)
//     const user = await FirebaseService.getDataFromRef(userRef)
//     const userWith = await FirebaseService.getDataFromRef(userWithRef)

//     if (!user || !userWith || !user.notificationToken || date.accepted) return
//     console.log('Push notification for ' + user.firstName)

//     const notification = {
//       title: 'The Zero Date',
//       body: `Do you want a date with ${userWith.firstName}?`
//     }
//     return admin.messaging().send({
//       notification,
//       token: user.notificationToken
//     })
//   })

export const checkUserCollections = functions.https.onCall(
  async (_: unknown, context) => {
    const id = context.auth?.uid
    if (!id) return

    const status = await FirebaseService.db
      .collection(USER_STATUSES_COLLECTION)
      .doc(id)
      .get()
    const events = await FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(id)
      .get()
    if (!status.data()) await UserService.setupStatus(id)
    if (!events.data()) await UserService.setupEvents(id)
    return
  }
)

export const onUserStatusChanged = functions.database
  .ref(RDB_ONLINE_REF)
  .onUpdate(async (change, context) => {
    const eventStatus = change.after.val()
    const userStatusesRef = FirebaseService.db
      .collection(USER_STATUSES_COLLECTION)
      .doc(context.params.uid)
    const statusSnapshot = await change.after.ref.once('value')
    const status = statusSnapshot.val()
    if (status.changed > eventStatus.changed) return
    if (!eventStatus.status) {
      console.log(
        'changing status for',
        context.params.uid,
        'to',
        eventStatus.status
      )
      return !eventStatus.status && userStatusesRef.update({ here: false })
    }
    return
  })
