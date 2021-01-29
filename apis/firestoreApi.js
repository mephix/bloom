
var db = getDb()

exports.list = list
exports.get = get
exports.create = create
exports.update = update
exports.patch = patch
exports.delete = remove

/*
 * FieldValue: contains useful fields such as
 *  - serverTimestamp() to set a field to 'now'.
 *  - arrayUnion(item) to add an item (uniquely) to an array
 *  - arrayRemove(item) to remove an item from an array
 *  - increment(by) to increment a numeric field
 *  - delete() to remove a field.
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

async function get (collection, id) {
  await db.collection(collection).doc(id).get()
  if (doc.exists) return doc.data()
  else {
    console.warn(`Document ${id} does not exist.`)
    return undefined
  }
}
/*
 * Use `create` to create a new document with randomly generated id.
 */
function create (collection, data) {
  return db.collection(collection).add(data)
}

/*
 * Use `update` to overwrite an existing document, or create a new document with
 * specified id.
 * 
 */
function update (collection, id, data) {
  return db.collection(collection).doc(id).set(data) 
}

/*
 * Use `patch` to update only the specified fields of an existing document.
 */
function patch (collection, id, data) {
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
   * process.cwd(), currently it is 'kal') then we don't need to type it at
   * the terminal (we used to have to type: export FIREBASE_CONFIG={} at the
   * terminal every time).
   *
   * Then, download 'bloom-dating-firebase-adminsdk-gqirl-d8653bb914.json'
   * into this folder from Firebase Settings -> Service Accounts) (no longer
   * from google cloud console (IAM & Admin -> Service Accounts)) and require
   * it and use it for app initialization.
   */
  const { firebaseConfig } = require('../DO_NOT_COMMIT.js')
  const dotenv = require('dotenv')
  dotenv.config()
  const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG)
  const admin = require('firebase-admin')
  adminConfig.credential = admin.credential.cert(firebaseConfig.serviceAccountKey)
  adminConfig.databaseURL = "https://bloom-dating.firebaseio.com"
  admin.initializeApp(adminConfig)
  const db = admin.firestore()
  // Need to set 'timestampsInSnapshots' otherwise firebase prints out a
  // long warning.
  db.settings({ timestampsInSnapshots: true })
  // Attach 'FieldValue'.
  db.FieldValue = admin.firestore.FieldValue
  return db
}