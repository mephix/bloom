const { msleep } = require('sleep')
const getAllUsers = require('../users/getAllUsers.js')
const setProfileDefaults = require('../users/setProfileDefaults.js')
const prospectEngine = require('./prospectEngine.js')
const writeScoresToFile = require('../scores/writeScoresToFile.js')
const subsetScores = require('../scores/subsetScores.js')
const adaloApi = require('../adaloApi.js')

module.exports = runProspectEngine

/* 
 * Test and run here
 */
const PROSPECT_GRAPH_FILE = './csvs/Prospects (all positive).csv'
// const USER_LOCAL_FILE = './csvs/Users 1644 (ids added).json' //'./csvs/Users (prospects).json'
const backupFile = './csvs/Users 20201222.json'
const newBackupFile = './csvs/Users 20201225.json'

runProspectEngine()

async function runProspectEngine() {
  console.log(`Starting Prospect Engine...`)
  // Get Users. refresh=false is for testing and debugging
  // because downloading the collections from Adalo is slow.
  let { users } = await getAllUsers({
    refresh: false,
    backupFile,
    newBackupFile,
    maxUsers: 300,
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

  // Post prospects to Adalo.
  let ids = Object.keys(score)
  // Try sending them in batches, last ids first, with pauses in between. 
  ids = ids.reverse()
  let BATCH_LENGTH = 30
  for (let i=90; i<ids.length; i+=BATCH_LENGTH) {
    const batchOfIds = ids.slice(i,i+BATCH_LENGTH)
    let r = await Promise.all(batchOfIds.map(id => {
      const Prospects = Object.keys(score[id]).map(Number)
      if (Prospects.length > 0)
        return adaloApi.update('Users', id, { Prospects })
    }))
    console.log(`Distinct responses: ${[...new Set(r.map(ri=>ri.statusText))]}`)
    msleep(7000)
  }

  return score
}