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
  const { idDate1, idDate2 } = dateIdsForFirebase(date)
  const refDate1 = firestoreApi.db.collection('Dates').doc(idDate1)
  const refDate2 = firestoreApi.db.collection('Dates').doc(idDate2)
  const refRoom =  firestoreApi.db.collection('Rooms').doc(date.dailyRoomName)

  // Create the pair of Firebase date objects.
  const commonFields = {
    'active': true,
    'start': date.startTime,
    'end': date.endTime,
    'room': refRoom,
  }
  const for1 = {
    'for':  firestoreApi.db.collection('Users').doc(date.id1),
    'with': firestoreApi.db.collection('Users').doc(date.id2),
    'token': date.token1,
  }
  const for2 = {
    'for':  firestoreApi.db.collection('Users').doc(date.id2),
    'with': firestoreApi.db.collection('Users').doc(date.id1),
    'token': date.token2,
  }
  const date1 = { ...commonFields, ...for1, }
  const date2 = { ...commonFields, ...for2, }

  // Create the Room.
  const room = {
    nbf: date.nbf,
    exp: date.exp,
    name: date.dailyRoomName,
    url: date.dailyRoomURL,
    dates: [refDate1, refDate2],
  }

  // Add the two Dates and their Room in a batch.
  const batch = firestoreApi.db.batch()
  batch.set(refDate1, date1)
  batch.set(refDate2, date2)
  batch.set(refRoom, room)
  return batch.commit()
}

function dateIdsForFirebase (date) {
  let idDate1 = `${date.startTime}_${date.name1}_${date.name2}_${nanoid.nanoid()}`
  let idDate2 = `${date.startTime}_${date.name2}_${date.name1}_${nanoid.nanoid()}`
  return { idDate1, idDate2 }
}