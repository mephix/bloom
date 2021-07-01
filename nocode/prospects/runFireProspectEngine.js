const addLikesNextsDatesLocally = require('./addLikesNextsDatesLocally.js')
const fireMapFieldNames = require('./fireMapFieldNames.js')
const fireProspectEngine = require('../prospects/fireProspectEngine.js')
const applyToScores = require('../scores/applyToScores.js')
const subsetScores = require('../scores/subsetScores.js')
const firestoreApi = require('../apis/firestoreApi.js')
const consoleColorLog = require('../utils/consoleColorLog.js')

runFireProspectEngine()

function runFireProspectEngine() {

  // Add Likes Nexts & Dates to each User.
  users = addLikesNextsDatesLocally(users, today)

  // Calculate prospects according to people's preferences.
  // Convert prospects from 0-1 to 0-100 then keep only scores above a cutoff.
  let usersOldFieldNames = fireMapFieldNames(users)
  let { score, subScores, peopleById } = fireProspectEngine(usersOldFieldNames)
  score = applyToScores(score, x => Math.floor(x*100)/100)
  const CUTOFF = 0.0
  score = subsetScores(score, { above: CUTOFF })

  // Post prospects to Firebase.
  // Max 500 writes allowed in a batch.
  const batch = firestoreApi.db.batch()
  let fireIds = Object.keys(score)
  const MAX_WRITES = 500
  const N_BATCHES = Math.ceil(fireIds.length / MAX_WRITES)
  for (let batchNumber=1; batchNumber < N_BATCHES; batchNumber++) {
    fireIds = fireIds.slice(MAX_WRITES*(batchNumber-1), MAX_WRITES*batchNumber)
    fireIds.map(fireId => {
      // Limit to 100 prospects per night.
      // Keep them in order (dont randomize by sorting alphabetically)
      // because we want people to first see people who have liked them already.
      let prospects = Object.keys(fireScore[fireId]).slice(0,100)

      // Convert person & their prospects from strings to refs.
      const ref = firestoreApi.db.collection('Prospects-dev').doc(fireId)
      prospects = prospects.map(p => firestoreApi.db.collection('Users-dev').doc(p))

      const firstName = users.filter(u => u.id === fireId)[0].firstName
      if (prospects.length > 0) {
        batch.set(ref, { prospects })
        consoleColorLog(`[${firstName}]: ${prospects.length} prospects added to batch.`, 'green')
      } else {
        consoleColorLog(`[${firstName}]: no prospects.`, 'yellow')
      }

    })
    let response = await batch.commit()
    consoleColorLog(`Batch ${batchNumber} of ${N_BATCHES} committed at ${response[0].writeTime.toDate()}`, 'green')
  }
  return
}
