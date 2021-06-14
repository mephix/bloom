/*
 * Key parameters to set
 */
const today = '2021-06-14'

// File to load users from and store prospects:
// const localUsersFile = `./nocode/output/Users ${today}.json`
// const OUTPUT_FILE = `./nocode/output/Prospects ${today}.csv`
const writeToOutputFile = false

// const getAllUsers = require('../users/getAllUsers.js')
const fs = require('fs')
// const fserr = err => {if (err) return console.log(err)}
const mapFirebaseToAdaloIds = require('../db/mapFirebaseToAdaloIds.js')
const setProfileDefaults = require('../users/setProfileDefaults.js')
// const switchToFirebaseIds = require('../users/switchToFirebaseIds.js')
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

  // Get Adalo users.
  const adaloUsersInputFile = `./nocode/output/Users ${today}.json`
  // const adaloUsersOutputFile = `./nocode/output/Users ${today} updated.json`
  const fs = require('fs')
  const fserr = err => {if (err) return console.log(err)}
  let adaloUsers = JSON.parse(fs.readFileSync(adaloUsersInputFile, 'utf8'))

  // Get Firebase dev users
  const firestoreApi = require('../apis/firestoreApi.js')
  const fireDevUsersFile = `./nocode/output/Users-dev ${today} from firebase.json`
  let fireDevUsers = JSON.parse(fs.readFileSync(fireDevUsersFile, 'utf8'))

  // Create Prospects for Adalo users.
  // Fill in missing profile fields with sensible defaults.
  users = adaloUsers.map(setProfileDefaults)
  // Rank prospects according to people's preferences.
  let { score, subScores, peopleById } = prospectEngine(users)
  // Keep only scores above a cutoff.
  // We're scoring prospects 0-1.
  const CUTOFF = 0.0
  score = applyToScores(score, x => Math.floor(x*100)/100)
  score = subsetScores(score, { above: CUTOFF })
  // Write prospects to file, along with prefs and subscores.
  if (writeToOutputFile) writeScoresToFile({ people: peopleById, score, subScores, fileName: OUTPUT_FILE, })

  // Subset score to Firebase Users-dev
  let fireScore = {}
  let { idMapA2F } = mapFirebaseToAdaloIds(adaloUsers, fireDevUsers)
  Object.keys(score).map(adaloId => {
    if (!idMapA2F[adaloId]) return
    else {
      Object.keys(score[adaloId]).map(prospectId => {
        if (!idMapA2F[prospectId]) return
        if (fireScore[idMapA2F[adaloId]]) 
          fireScore[idMapA2F[adaloId]][idMapA2F[prospectId]] = score[adaloId][prospectId]
        else 
          fireScore[idMapA2F[adaloId]] = { [idMapA2F[prospectId]]: score[adaloId][prospectId] }
      })
    }
  })

  // Get ready to post prospects to Firebase.
  const batch = firestoreApi.db.batch()
  let fireIds = Object.keys(fireScore)
  fireIds = fireIds.slice(0,500) // max 500 writes allowed in a batch.
  fireIds.map(fireId => {
    // Limit to 100 prospects per night.
    // Keep them in order (dont randomize by sorting alphabetically)
    // because we want people to first see people who have liked them already.
    let prospects = Object.keys(fireScore[fireId]).slice(0,100)
    // Convert person & their prospects from strings to refs.
    const ref = firestoreApi.db.collection('Prospects-dev').doc(fireId)
    prospects = prospects.map(p => firestoreApi.db.collection('Users-dev').doc(p))
    const email = fireDevUsers.filter(u => u.id === fireId)[0].email
    if (prospects.length > 0) {
      batch.set(ref, { prospects })
      consoleColorLog(`[${email}]: ${prospects.length} prospects added to batch.`, 'green')
    } else {
      consoleColorLog(`[${email}]: no prospects.`, 'yellow')
    }

  })
  let response = await batch.commit()
  consoleColorLog(`Batch committed at ${response[0].writeTime.toDate()}`, 'green')
  return
}
  // const idxBeg = 0
  // const idxEnd = ids.length // max 500 writes allowed in a batch.
  // for (let i=idxBeg; i<idxEnd; i++) {
  //   let id = ids[i]
  //   // Limit to 100 prospects per night.
  //   // Keep them in order (dont randomize by sorting alphabetically) because we want people to first see
  //   // people who have liked them already.
  //   let prospects = Object.keys(score[id]).slice(0,100)
  //   // Convert from strings to refs.
  //   prospects = prospects.map(m => firestoreApi.db.collection('Users').doc(m))
  //   if (prospects.length > 0) {
  //       const ref = firestoreApi.db.collection('Prospects').doc(idMapA2F[id])
  //       batch.set(ref, { prospects })
  //       consoleColorLog(`[${i}]: ${id}: ${prospects.length} prospects added to batch.`, 'green')
  //   } else {
  //     consoleColorLog(`[${i}]: ${id}: no prospects.`, 'yellow')
  //   }
  // }
  // consoleColorLog(`About to commit ${batch._ops.length} out of ${idxEnd - idxBeg} records...`) 

  // // Ids
  // let ids = Object.keys(score).reverse()

  //   // !! for debugging !!
//   ids = ['john.prins@gmail.com', 'amel.assioua@gmail.com', 'test3@example.com', 'test@example.com', 'test2@example.com', ]
//   score['test@example.com']  = { 'test2@example.com': 0.99 } //score['glenntheblack@gmail.com']
// //   peopleById['test@example.com'] = { Email: 'glenntheblack@gmail.com' }
//   score['test2@example.com'] = { 'test@example.com': 0.99 } //score['wren301@gmail.com']
// //   peopleById['test2@example.com'] = { Email: 'wren301@gmail.com' }
//   score['test3@example.com'] = score['rana@email.arizona.edu']
//   peopleById['test3@example.com'] = { Email: 'rana@email.arizona.edu' }
  
  // const idxBeg = 0
  // const idxEnd = ids.length // max 500 writes allowed in a batch.
  // for (let i=idxBeg; i<idxEnd; i++) {
  //   let id = ids[i]
  //   // Limit to 100 prospects per night.
  //   // Keep them in order (dont randomize by sorting alphabetically) because we want people to first see
  //   // people who have liked them already.
  //   let prospects = Object.keys(score[id]).slice(0,100)
  //   // Convert from strings to refs.
  //   prospects = prospects.map(m => firestoreApi.db.collection('Users').doc(m))
  //   if (prospects.length > 0) {
  //       const ref = firestoreApi.db.collection('Prospects').doc(idMapA2F[id])
  //       batch.set(ref, { prospects })
  //       consoleColorLog(`[${i}]: ${id}: ${prospects.length} prospects added to batch.`, 'green')
  //   } else {
  //     consoleColorLog(`[${i}]: ${id}: no prospects.`, 'yellow')
  //   }
  // }
  // consoleColorLog(`About to commit ${batch._ops.length} out of ${idxEnd - idxBeg} records...`) 

