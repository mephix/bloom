/**
 * Get database (Firestore) for use in backend scripts.
 * 
 * First, thanks to the 'dotenv' package, we can write FIREBASE_CONFIG={}
 * in the '.env' file in the working directory (which can be found with
 * process.cwd(), currently it is 'kal') then we don't need to type it at
 * the terminal (we used to have to type: export FIREBASE_CONFIG={} at the
 * terminal every time).
 * 
 * Then, download 'serviceAccountKey.json' into this folder from google
 * cloud console (IAM & Admin -> Service Accounts) and require it and use
 * it for app initialization.
 */
const dotenv = require('dotenv')
const serviceAccountKey = require('./serviceAccountKey.json')

module.exports = function getDb () {
  dotenv.config()
  const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG)
  const admin = require('firebase-admin')
  adminConfig.credential = admin.credential.cert(serviceAccountKey)
  admin.initializeApp(adminConfig)
  var db = admin.firestore()
  // Need to set 'timestampsInSnapshots' otherwise firebase prints out a
  // long warning.
  db.settings({ timestampsInSnapshots: true })
  // Attach 'FieldValue'.
  db.FieldValue = admin.firestore.FieldValue
  return db
}