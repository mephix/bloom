const fs = require('fs')
// const fserr = err => {if (err) return console.log(err)}
const consoleColorLog = require('../utils/consoleColorLog.js')
const firestoreApi = require('../apis/firestoreApi.js')

/*
 * We want to take the JSON of users,
 * and update them in Firebase in a batch.
 */
const today = '2021-05-17'
const existingFile = `./nocode/output/Users ${today}.json`

const firebaseFields = {
  'id': 'adaloId',
  'First Name': 'firstName',
  'Email': 'email',
  'Bio': 'bio',
}

uploadtoFirebase()

async function uploadtoFirebase() {
  // Get the Users downloaded from Adalo.
  let existingRecords = JSON.parse(fs.readFileSync(existingFile, 'utf8'))

  // !!! FOR DEBUGGING !!!
  // Also max 500 writes are allowed.
  existingRecords = existingRecords.slice(500,1000)

  // Upload the users to Firebase in a batch.
  const batch = firestoreApi.db.batch()
  existingRecords.forEach(adaloRecord => {
    const id = adaloRecord.Email
    const ref = firestoreApi.db.collection('Users').doc(id)
    // Set the fields to copy.
    let p = adaloRecord?.['Posivibes']
    let firebaseRec = {
      here: false,
      free: true,
      finished: false,
      waitStartTime: null,
      firstName: adaloRecord?.['First Name'],
      email: adaloRecord?.['Email'],
      bio: adaloRecord?.['Bio'] || null,
      adaloId: adaloRecord?.['id'],
      face: adaloRecord?.['Face']?.['url'] || null,
      // Keep posivibes >=0 but replace null/undefined with default value of 1.
      posivibes: (p || p===0) ? p : 1,
    }
    // Add this user to the batch.
    // Skip users who don't have an email and firstName.
    if (id && firebaseRec.adaloId) {
      batch.set(ref, firebaseRec)
    } else {
      consoleColorLog(`Skipping ${id} with Adalo id ${firebaseRec.adaloId}:`, 'red')
      consoleColorLog(`first name: ${firebaseRec.firstName}`)
      consoleColorLog(`face: ${firebaseRec.face}`)
      consoleColorLog(`bio: ${firebaseRec.bio}`)
      consoleColorLog(``)
    }
  })
  consoleColorLog(`About to commit ${batch._ops.length} out of ${existingRecords.length} records...`, 'green') 
  return batch.commit()

}