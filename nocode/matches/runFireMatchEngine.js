/*
 * Key parameters to set
 */
const today = '2021-05-17'

// File to load users from and store matches:
const loadFromLocalFile = `./nocode/output/Users ${today}.json`
const MATCH_GRAPH_FILE = `./nocode/output/Matches ${today}.csv`

const getAllUsers = require('../users/getAllUsers.js')
const setProfileDefaults = require('../users/setProfileDefaults.js')
const fireMatchEngine = require('./fireMatchEngine.js')
const writeScoresToFile = require('../scores/writeScoresToFile.js')
const applyToScores = require('../scores/applyToScores.js')
const subsetScores = require('../scores/subsetScores.js')
const consoleColorLog = require('../utils/consoleColorLog.js')
const firestoreApi = require('../apis/firestoreApi.js')

module.exports = runFireMatchEngine

/* 
 * Test and run here
 */
runFireMatchEngine()

async function runFireMatchEngine() {
  consoleColorLog(`Starting Fire Match Engine...`)
  // Get Users. refresh=false now because we can't get all users
  // from Adalo anymore due to 503s.
  let { users } = await getAllUsers({
    refresh: false,
    backupFile: loadFromLocalFile,
  })
  
  // Fill in missing profile fields with sensible defaults.
  users = users.map(setProfileDefaults)

  // For Firebase, switch users and scores from adaloIds to emails.
  let usersById = {}
  users.map(({ id, ...rest }) => usersById[id] = { id, ...rest })
  users = users.map(u => {
    u.adaloId = u.id
    u.id = u.Email
    u.Likes = u.Likes.map(aid => usersById[aid].Email)
    u.Nexts = u.Nexts.map(aid => usersById[aid].Email)
    return u
  })

  // Rank matches according to people's preferences.
  let { score, subScores, peopleById } = fireMatchEngine(users)

  // Keep only scores above a cutoff.
  // For firebase, we're scoring matches 1-100.
  const CUTOFF = 1
  score = applyToScores(score, Math.floor)
  score = subsetScores(score, { above: CUTOFF })

  // Write matches to file, along with prefs and subscores.  
  // writeScoresToFile({
  //   people: peopleById,
  //   score,
  //   subScores,
  //   fileName: MATCH_GRAPH_FILE,
  // })

  // Post matches to Firebase.
  const batch = firestoreApi.db.batch()
  let ids = Object.keys(score).reverse()

  // !! for debugging !!
  ids = ['john.prins@gmail.com', 'amel.assioua@gmail.com', 'test@example.com', 'test2@example.com', 'test3@example.com']
  score['test@example.com']  = score['glenntheblack@gmail.com']
  peopleById['test@example.com'] = { Email: 'glenntheblack@gmail.com' }
  score['test2@example.com'] = score['wren301@gmail.com']
  peopleById['test2@example.com'] = { Email: 'wren301@gmail.com' }
  score['test3@example.com'] = score['rana@email.arizona.edu']
  peopleById['test3@example.com'] = { Email: 'rana@email.arizona.edu' }
  
  const idxBeg = 0
  const idxEnd = ids.length // max 500 writes allowed in a batch.
  for (let i=idxBeg; i<idxEnd; i++) {
    let id = ids[i]
    // Limit to 100 matches per night.
    // For now, randomize them in score order (by sorting in alphabetical order).
    let matches = Object.keys(score[id]).slice(0,100).sort()
    // Convert from strings to refs.
    matches = matches.map(m => firestoreApi.db.collection('Users').doc(m))
    // const oldmatches = peopleById[id].Matches
    if (matches.length > 0) {
      // if (oldmatches.length === 0) {
        // Check 'Matches' and { matches }
        const ref = firestoreApi.db.collection('Matches').doc(id)
        batch.set(ref, { matches })
        consoleColorLog(`[${i}]: ${id}: ${matches.length} matches added to batch.`, 'green')
      // }
    } else {
      consoleColorLog(`[${i}]: ${id}: no matches.`, 'yellow')
    }
  }
  consoleColorLog(`About to commit ${batch._ops.length} out of ${idxEnd - idxBeg} records...`) 
  let response = await batch.commit()
  consoleColorLog(`Batch committed at ${response[0].writeTime.toDate()}`, 'green')
  return
}