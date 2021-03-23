const fs = require('fs')
const fserr = err => {if (err) return console.log(err)}
const consoleColorLog = require('../utils/consoleColorLog.js')
const firestoreApi = require('../apis/firestoreApi.js')

/*
 * We want to take the JSON of users,
 * and update them in Firebase in a batch.
 */
const today = '2021-03-16'
const existingFile = `./csvs/Users ${today}.json`

const firebaseFields = {
  'id': 'adaloId',
  'First Name': 'firstName',
  'Email': 'email',
  'Bio': 'bio',
  // 'Wait Start Time': 'waitStartTime',
  // 'Here': 'here',
  // 'Free': 'free',
  // 'Finished' : 'finished',
  // 'Posivibes': 'posivibes',
  // 'Prospects': 'prospects',
  // 'Likes': 'likes',
  // 'Nexts': 'nexts',
}

uploadtoFirebase()

async function uploadtoFirebase() {
  // Get the Users downloaded from Adalo.
  let existingRecords = JSON.parse(fs.readFileSync(existingFile, 'utf8'))

  // !!! FOR DEBUGGING !!!
  existingRecords = existingRecords.slice(516,)

  // Upload the users to Firebase in a batch.
  const batch = firestoreApi.db.batch()
  existingRecords.forEach(adaloRecord => {
    const id = adaloRecord.Email
    const ref = firestoreApi.db.collection('Users').doc(id)
    let firebaseRec = {
      here: false,
      free: true,
      finished: false,
      waitStartTime: null,
    }
    const adaloFields = Object.keys(firebaseFields)
    adaloFields.map(adaloField => {
      if (adaloRecord[adaloField] !== undefined) 
        firebaseRec[firebaseFields[adaloField]] = adaloRecord[adaloField]
    })
    if (firebaseRec['posivibes']===undefined) firebaseRec['posivibes'] = 1
    batch.set(ref, firebaseRec)
  })  
  return batch.commit()

}