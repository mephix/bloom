const firestoreApi = require('../apis/firestoreApi.js')
const nanoid = require('nanoid')

module.exports = postDateToFirebase

function postDateToFirebase(date) {
  /*
   * `date` should contain the fields:
   * name1, name2, id1, id2 (of participants)
   * dailyRoomName, dailyRoomURL, nbf, exp
   * token1, token2 (for participants)
   * startTime, endTime
   */

  // Create Firestore ids and refs.
  // const { idDate1, idDate2 } = dateIdsForFirebase(date)
  const { idDate1 } = dateIdsForFirebase(date)
  const refDate1 = firestoreApi.db.collection('Dates').doc(idDate1)
  // const refDate2 = firestoreApi.db.collection('Dates').doc(idDate2)
  const refRoom =  firestoreApi.db.collection('Rooms').doc(date.dailyRoomName)
  // const refUser1 = firestoreApi.db.collection('Users').doc(date.id1)
  // const refUser2 = firestoreApi.db.collection('Users').doc(date.id2)

  // Create the pair of Firebase date objects.
  const commonFields = {
    'start': new Date(date.startTime),
    'end':   new Date(date.endTime),
    'room': refRoom,
    'active': true,
    // Start with accepted=true, and later on don't set it.
    'accepted': false,
  }
  // Firebase uses emails, not Adalo IDs.
  const for1 = {
    'for':  date.email1,
    'with': date.email2,
    // !! change back after debugging !!
    'token': date.token1, //{ for: date.token1, with: date.token2 },
  }
  // const for2 = {
  //   'for':  date.email2,
  //   'with': date.email1,
  //   'token': date.token2,
  // }
  const date1 = { ...commonFields, ...for1, }
  // const date2 = { ...commonFields, ...for2, }

  // Create the Room.
  const room = {
    nbf: date.nbf,
    exp: date.exp,
    name: date.dailyRoomName,
    url: date.dailyRoomURL,
    date: refDate1,
    // dates: [refDate1, refDate2],
  }

  // Add the Date and their Room in a batch.
  const batch = firestoreApi.db.batch()
  batch.set(refDate1, date1)
  // batch.set(refDate2, date2)
  batch.set(refRoom, room)
  return batch.commit()
}

function dateIdsForFirebase (date) {
  let idDate1 = `${date.startTime}_${date.name1}_${date.name2}_${nanoid.nanoid()}`
  let idDate2 = `${date.startTime}_${date.name2}_${date.name1}_${nanoid.nanoid()}`
  return { idDate1, idDate2 }
}

function isoToDate (iso) {
  // Converts an ISO date string like '2021-02-18T17:34:11.395Z' to a js
  // Date object.
  const [y, m, d] = iso.slice(0,10).split('-').map(s => Number(s)) 
  const [hh, mm, ss] = iso.slice(11,19).split(':').map(s => Number(s))
  return new Date(y, m, d, hh, mm, ss)
}