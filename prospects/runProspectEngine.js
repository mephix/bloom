const getUsers = require('../getUsers.js')
const formatUserFields = require('../formatUserFields.js')
const prospectEngine = require('./prospectEngine.js')
const writeScoresToFile = require('../scores/writeScoresToFile.js')
const subsetScores = require('../scores/subsetScores.js')
const adaloApi = require('../adaloApi.js')

module.exports = runProspectEngine

/* 
 * Test and run here
 */
const PROSPECT_GRAPH_FILE = './csvs/Prospects (all positive).csv'
const USER_LOCAL_FILE = './csvs/Users 1644 (ids added).json' //'./csvs/Users (prospects).json'
const refresh = false

runProspectEngine()

async function runProspectEngine() {
  console.log(`Starting Prospect Engine...`)
  // Get Users. refresh=false is for testing and debugging
  // because downloading the collections from Adalo is slow.
  let users = await getUsers({ refresh, fileName: USER_LOCAL_FILE })
  let people = users.map(formatUserFields)

  // Rank prospects according to people's preferences.
  let { score, subScores, peopleById } = prospectEngine(people)

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
  // Object.keys(score)
  // !! FOR DEBUGGING TRY JUST ONE !!
  const ids = [Object.keys(score)[0]] // Object.keys(score)
  ids.map(id => {
    const prospects = Object.keys(score[id]).map(Number)
    adaloApi.update('Users', id, { prospects })
  })

  return score
}