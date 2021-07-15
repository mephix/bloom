const loadLocally = require('../db/loadLocally.js')
const setFireProfileDefaults = require('../users/setFireProfileDefaults.js')
const addLikesNextsDatesLocally = require('../dates/addLikesNextsDatesLocally.js')
const fireMapFieldNames = require('../dates/fireMapFieldNames.js')
const prospectEngine = require('./prospectEngine.js')
const applyToScores = require('../scores/applyToScores.js')
const subsetScores = require('../scores/subsetScores.js')
const firestoreApi = require('../apis/firestoreApi.js')
const consoleColorLog = require('../utils/consoleColorLog.js')

/*
 * PARAMETERS TO SET
 */
today = '2021-07-13'
const dev = '-dev' // '' //

runFireProspectEngine()

async function runFireProspectEngine() {

  // Load users.
  let currentUsers = loadLocally('Users-dev', today)
  let currentIds = currentUsers.map(u => u.id)

  // Add Likes Nexts & Dated.
  currentUsers = addLikesNextsDatesLocally(currentUsers, today)

  // Load old users and make their phone their id.
  let restoreUsers = loadLocally('RestoreUsers', today)
  restoreUsers = restoreUsers
    .filter(u => u.phone)
    .map(u => {
      u.id = u.phone
      return u
    })

  // Merge the two sets of users
  let users = [...currentUsers, ...restoreUsers]

  // Fill in missing profile fields with best guesses.
  users = users.map(setFireProfileDefaults)

  // Map field names for shared use of `prospectEngine`.
  let usersOldFieldNames = fireMapFieldNames(users)

  // Calculate prospects according to people's preferences.
  // Convert prospects from 0-1 to 0-100 then keep only scores above a cutoff.
  // Note that 'floor' will zero all scores that are too small.
  let { score, subScores, peopleById } = prospectEngine(usersOldFieldNames)
  score = applyToScores(score, x => Math.floor(x*10000)/100)
  const CUTOFF = 0.0
  score = subsetScores(score, { above: CUTOFF })

  // Post prospects to Firebase.
  // Max 500 writes allowed in a batch.
  const batch = firestoreApi.db.batch()
  let fireIds = currentUsers.map(u => u.id) // Object.keys(score)
  const MAX_WRITES = 500
  const N_BATCHES = Math.ceil(fireIds.length / MAX_WRITES)
  for (let batchNumber=1; batchNumber <= N_BATCHES; batchNumber++) {
    fireIds = fireIds.slice(MAX_WRITES*(batchNumber-1), MAX_WRITES*batchNumber)
    fireIds.map(fireId => {
      // Limit to 100 prospects per night.
      // Keep them in order (dont randomize by sorting alphabetically)
      // because we want people to first see people who have liked them already.
      let prospects = Object.keys(score[fireId]).slice(0,100)

      // Convert person & their prospects to refs or phone numbers
      // depending on whether they are from Users-dev or RestoreUsers.
      const ref = firestoreApi.db.collection('Prospects-dev').doc(fireId)
      prospects = prospects.map(p => {
        if (currentIds.includes(p)) return firestoreApi.db.collection('Users-dev').doc(p)
        // At the moment, we could show restored users by phone, but for safety, don't do it yet.
        // else return null
        else 
          return restoreUsers.find(u => u.id === p)?.phone || null
      })
      prospects = prospects.filter(p => p !== null)

      // Add prospects to batch.
      const firstName = users.filter(u => u.id === fireId)[0].firstName
      if (prospects.length > 0) {
        batch.set(ref, { prospects })
        consoleColorLog(`[${firstName}]: ${prospects.length} prospects added to batch.`, 'green')
      } else {
        consoleColorLog(`[${firstName}]: no prospects.`, 'yellow')
      }
    })
    let response = await batch.commit()
    consoleColorLog(`Batch ${batchNumber} of ${N_BATCHES} committed at ${response[0].writeTime.toDate()}`, 'green', 'bold')
  }
  return
}
