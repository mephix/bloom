const firestoreApi = require('../apis/firestoreApi.js')
const nanoid = require('nanoid')

module.exports = postDateToFirebase

function postDateToFirebase(date) {
  const DATES = 'Dates-dev'
  const USERS = 'Users-dev'
  /*
   * `date` should contain the fields:
   * forName, withName, for, with (of participants)
   * dailyRoomName, dailyRoomURL, nbf, exp
   * token1, token2 (for participants)
   * startTime, endTime
   */

  // Create Firestore ids and refs.
  const { idDate1 } = dateIdsForFirebase(date)
  const refDate = firestoreApi.db.collection(DATES).doc(idDate1)

  // Create the Firebase date object.
  const fDate = {
    'start': new Date(date.startTime),
    'end':   new Date(date.endTime),
    'room': date.dailyRoomURL,
    'active': true,

    // The following is ONLY FOR TEST DATES
    // // !! temp set `active` false and add `rate` so testers can see the date in Activity !!
    // 'active': false,
    // 'rate': { for: { heart: false }, with: { heart: false } },

    // Start with accepted=true, and later on don't set it.
    'accepted': true,
    'for': date.for,
    'with': date.with,
  }

  // Add the Date and both people's 'dateWith' in a batch.
  const batch = firestoreApi.db.batch()
  batch.set(refDate, fDate)
  batch.update(firestoreApi.db.collection(USERS).doc(fDate.for), { dateWith: fDate.with }, { merge: true })
  batch.update(firestoreApi.db.collection(USERS).doc(fDate.with), { dateWith: fDate.for }, { merge: true })

  // Commit
  return batch.commit()
}

function dateIdsForFirebase (date) {
  let idDate1 = `${date.startTime}_${date.forName}_${date.withName}_${nanoid.nanoid()}`
  let idDate2 = `${date.startTime}_${date.withName}_${date.forName}_${nanoid.nanoid()}`
  return { idDate1, idDate2 }
}

function isoToDate (iso) {
  // Converts an ISO date string like '2021-02-18T17:34:11.395Z' to a js
  // Date object.
  const [y, m, d] = iso.slice(0,10).split('-').map(s => Number(s)) 
  const [hh, mm, ss] = iso.slice(11,19).split(':').map(s => Number(s))
  return new Date(y, m, d, hh, mm, ss)
}