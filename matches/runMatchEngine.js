const getUsers = require('./getUsers.js')
const formatUserFields = require('../formatUserFields.js')
const matchEngine = require('./matchEngine.js')
const writeScoresToFile = require('../scores/writeScoresToFile.js')

module.exports = runMatchEngine

/* 
 * Test and run here
 */
const MATCH_GRAPH_FILE = './csvs/Matches (all positive).csv'
const USER_LOCAL_FILE = './csvs/Users (matches).json'
const refresh = false

runMatchEngine()

async function runMatchEngine() {
  console.log(`Starting Match Engine...`)
  // Get Users. refresh=false is for testing and debugging
  // because downloading the collections from Adalo is slow.
  let users = getUsers({ refresh, fileName: USER_LOCAL_FILE })
  let people = users.map(formatUserFields)

  // Rank matches according to people's preferences.
  let { compositeScore, subScores } = matchEngine(people)

  // Keep only scores above a cutoff.
  const CUTOFF = 0.01
  score = subsetScores(compositeScore, { above: CUTOFF })

  // Write matches to file, along with prefs and subscores.
  writeScoresToFile({
    people,
    score,
    subScores,
    fileName: MATCH_GRAPH_FILE,
  })

  return score
}