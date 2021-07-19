const firestoreApi = require('../apis/firestoreApi.js')
const nanoid = require('nanoid')

module.exports = postBroadcastDateToFirebase

function postBroadcastDateToFirebase(date) {
  const DATES = 'Dates-dev'

  // Create Firestore ids and refs.
  const dateId = `${date.startTime}_${date.forName}_${date.withName}_${nanoid.nanoid()}`
  const dateRef = firestoreApi.db.collection(DATES).doc(dateId)

  // Create the Firebase date object.
  const fDate = {
    'for': date.for,
    'with': date.with,
    'forName': date.forName,
    'withName': date.withName,
    'score': date.score,
    'start': new Date(date.startTime),
    'end': new Date(date.endTime),
    'nbf': date.nbf,
    'exp': date.exp,
    'active': true,
    // Don't set accepted=true for these broadcast dates.
    'accepted': false,
  }

  // Commit
  return dateRef.set(fDate)
}
