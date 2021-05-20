/*
 * Key parameters to set
 */
const today = '2021-05-20'

// File to load users from and store prospects:
const loadFromLocalFile = `./nocode/output/Users ${today}.json`
const OUTPUT_FILE = `./nocode/output/Prospects ${today}.csv`
const writeToOutputFile = false

const getAllUsers = require('../users/getAllUsers.js')
const setProfileDefaults = require('../users/setProfileDefaults.js')
const switchToFirebaseIds = require('../users/switchToFirebaseIds.js')
const prospectEngine = require('./prospectEngine.js')
const writeScoresToFile = require('../scores/writeScoresToFile.js')
const applyToScores = require('../scores/applyToScores.js')
const subsetScores = require('../scores/subsetScores.js')
const consoleColorLog = require('../utils/consoleColorLog.js')
const firestoreApi = require('../apis/firestoreApi.js')

module.exports = runFireProspectEngine

/* 
 * Test and run here
 */
runFireProspectEngine()

async function runFireProspectEngine() {
  consoleColorLog(`Starting Fire Prospect Engine...`)
  // Get Users. refresh=false now because we can't get all users
  // from Adalo anymore due to 503s.
  let { users } = await getAllUsers({
    refresh: false,
    backupFile: loadFromLocalFile,
  })
  
  // Fill in missing profile fields with sensible defaults.
  users = users.map(setProfileDefaults)

  // For Firebase, switch users and scores from adaloIds to emails.
  users = switchToFirebaseIds(users)

  // Rank prospects according to people's preferences.
  let { score, subScores, peopleById } = prospectEngine(users)

  // Keep only scores above a cutoff.
  // We're scoring prospects 0-1.
  const CUTOFF = 0.01
  score = applyToScores(score, x => Math.floor(x*100)/100)
  score = subsetScores(score, { above: CUTOFF })

  // Write prospects to file, along with prefs and subscores.
  if (writeToOutputFile) writeScoresToFile({ people: peopleById, score, subScores, fileName: OUTPUT_FILE, })

  // Post prospects to Firebase.
  const batch = firestoreApi.db.batch()
  let ids = Object.keys(score).reverse()

  // !! for debugging !!
  ids = ['john.prins@gmail.com', 'amel.assioua@gmail.com', 'test3@example.com', 'test@example.com', 'test2@example.com', ]
  score['test@example.com']  = { 'test2@example.com': 0.99 } //score['glenntheblack@gmail.com']
//   peopleById['test@example.com'] = { Email: 'glenntheblack@gmail.com' }
  score['test2@example.com'] = { 'test@example.com': 0.99 } //score['wren301@gmail.com']
//   peopleById['test2@example.com'] = { Email: 'wren301@gmail.com' }
  score['test3@example.com'] = score['rana@email.arizona.edu']
  peopleById['test3@example.com'] = { Email: 'rana@email.arizona.edu' }
  
  const idxBeg = 0
  const idxEnd = ids.length // max 500 writes allowed in a batch.
  for (let i=idxBeg; i<idxEnd; i++) {
    let id = ids[i]
    // Limit to 100 prospects per night.
    // Keep them in order (dont randomize by sorting alphabetically) because we want people to first see
    // people who have liked them already.
    let prospects = Object.keys(score[id]).slice(0,100)
    // Convert from strings to refs.
    prospects = prospects.map(m => firestoreApi.db.collection('Users').doc(m))
    if (prospects.length > 0) {
        const ref = firestoreApi.db.collection('Prospects').doc(id)
        batch.set(ref, { prospects })
        consoleColorLog(`[${i}]: ${id}: ${prospects.length} prospects added to batch.`, 'green')
    } else {
      consoleColorLog(`[${i}]: ${id}: no prospects.`, 'yellow')
    }
  }
  consoleColorLog(`About to commit ${batch._ops.length} out of ${idxEnd - idxBeg} records...`) 
  let response = await batch.commit()
  consoleColorLog(`Batch committed at ${response[0].writeTime.toDate()}`, 'green')
  return
}