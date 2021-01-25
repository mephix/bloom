// File to store prospects
const PROSPECT_GRAPH_FILE = './csvs/Prospects 2021-01-19.csv'
// File to load users from if API fails.
const loadFromLocalFile = './csvs/Users 2021-01-19.json'
// // File to store users in if API succeeds.
// const newBackupFile = './csvs/Prospects - Users 2021-01-12.json'

// const { msleep } = require('sleep')
const getAllUsers = require('../users/getAllUsers.js')
const setProfileDefaults = require('../users/setProfileDefaults.js')
const prospectEngine = require('./prospectEngine.js')
const writeScoresToFile = require('../scores/writeScoresToFile.js')
const subsetScores = require('../scores/subsetScores.js')
const adaloApi = require('../apis/adaloApi.js')

module.exports = runProspectEngine

/* 
 * Test and run here
 */
runProspectEngine()

async function runProspectEngine() {
  console.log(`Starting Thomas the Prospect Engine...`)
  // Get Users. refresh=false now because we can't get all users
  // from Adalo anymore due to 503s.
  let { users } = await getAllUsers({
    refresh: false,
    backupFile: loadFromLocalFile,
    // newBackupFile,
    // maxUsers: 370,
  })
  users = users.map(setProfileDefaults)

  // Rank prospects according to people's preferences.
  let { score, subScores, peopleById } = prospectEngine(users)

  // Keep only scores above a cutoff.
  const CUTOFF = 0.05
  score = subsetScores(score, { above: CUTOFF })

  // Write prospects to file, along with prefs and subscores.  
  writeScoresToFile({
    people: peopleById,
    score,
    subScores,
    fileName: PROSPECT_GRAPH_FILE,
  })

  // Post prospects to Adalo, in reverse order (newest signups first) and
  // one by one to avoid 503 errors.
  let ids = Object.keys(score).reverse()
  let responses = []
  for (let i=0; i<12; i++) { // !! CHANGE BACK TO: ids.length
    let id = ids[i]
    const Prospects = Object.keys(score[id]).map(Number)
    if (Prospects.length > 0) {
      let response = await adaloApi.update('Users', id, { Prospects })
      console.log(`[${i}]: ${peopleById[id].Email}: ${Prospects.length} prospects posted ${response.statusText}`)
      responses.push(response)
    } else {
      console.warn(`[${i}]: ${peopleById[id].Email}: no prospects.`)
      responses.push({ statusText: 'no prospects' })
    }
  }
  let responseSummary = [...new Set(responses.map(r=>r.statusText))]
  console.log(`Distinct responses: ${responseSummary}`)
  return score
}