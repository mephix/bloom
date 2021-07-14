import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/functions'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/messaging'
import 'firebase/database'
import { isProd } from 'utils'

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DB_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
}

firebase.initializeApp(firebaseConfig)

const functions = firebase.functions()
if (!isProd) functions.useEmulator('localhost', 8080)

export const FirebaseService = {
  db: firebase.firestore(),
  time: firebase.firestore.Timestamp,
  auth: firebase.auth,
  storage: firebase.storage(),
  functions,
  database: firebase.database,
  messaging: firebase.messaging
}
