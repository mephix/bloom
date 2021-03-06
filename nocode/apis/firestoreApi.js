
var db = getDb()

exports.list = list
exports.get = get
exports.set = set
exports.add = add
exports.modify = modify
exports.delete = remove
exports.db = db

/*
 * FieldValue: contains useful fields such as
 *  - serverTimestamp() to set a field to 'now'.
 *  - arrayUnion(item) to add an item (uniquely) to an array
 *  - arrayRemove(item) to remove an item from an array
 *  - increment(by) to increment a numeric field
 *  - delete() to remove a field.
 */

/*
 * `list` to get all documents in a collection.
 */
async function list (collection) {
  let docs = []
  const snapshot = await db.collection(collection).get()
  // Index the documents by id.
  snapshot.forEach(doc => {
    docs[doc.id] = doc.data()
  })
  return docs
}

/*
 * `get` a single document.
 */
async function get (collection, id) {
  await db.collection(collection).doc(id).get()
  if (doc.exists) return doc.data()
  else {
    console.warn(`Document ${id} does not exist.`)
    return undefined
  }
}

/*
 * Use `set` to create a new document, or overwrite an existing
 * document, with specified id.
 */
function set (collection, id, data) {
  return db.collection(collection).doc(id).set(data) 
}

/*
 * Use `add` to create a new document without specifying the id.
 */
function add (collection, data) {
  return db.collection(collection).add(data) 
}

/*
 * Use `modify` to update only the specified fields of an existing document.
 */
function modify (collection, id, data) {
  return db.collection(collection).doc(id).set(data, { merge: true }) 
}

/*
 * Use `remove` to delete an existing document.
 * Note that deleting a document does not delete its subcollections.
 */
function remove (collection, id) {
  return db.collection(collection).doc(id).delete() 
}

function getDb () {
  /**
   * Get database (Firestore) for use in backend scripts.
   *
   * First, thanks to the 'dotenv' package, we can write FIREBASE_CONFIG={}
   * in the '.env' file in the working directory (which can be found with
   * process.cwd(), currently it is 'bloom') then we don't need to type it at
   * the terminal (we used to have to type: export FIREBASE_CONFIG={} at the
   * terminal every time).
   * ** NOTE: this doesn't seem to be needed anymore.
   *
   * Then, download 'bloom-dating-firebase-adminsdk-gqirl-d8653bb914.json'
   * into this folder from Firebase Settings -> Service Accounts) (no longer
   * from google cloud console (IAM & Admin -> Service Accounts)) and require
   * it and use it for app initialization.
   */

  // const dotenv = require('dotenv')
  // dotenv.config()
  // try {
  //   const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG)
  // } catch (e) {
  //   throw new Error(`firestoreApi: could not parse FIREBASE_CONFIG from .env`)
  // }
  const { firebaseConfig } = require('../DO_NOT_COMMIT.js')
  const admin = require('firebase-admin')
  let adminConfig = {}
  adminConfig.credential = admin.credential.cert(firebaseConfig.serviceAccountKey)
  adminConfig.databaseURL = "https://bloom-dating.firebaseio.com"
  admin.initializeApp(adminConfig)
  const db = admin.firestore()
  // Need to set 'timestampsInSnapshots' otherwise firebase prints out a
  // long warning.
  db.settings({ timestampsInSnapshots: true })
  // Attach 'FieldValue'.
  db.FieldValue = admin.firestore.FieldValue
  db.Timestamp  = admin.firestore.Timestamp
  return db
}