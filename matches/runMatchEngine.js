const getUsers = require('./getUsers.js')
const formatUserFields = require('../formatUserFields.js')
const matchEngine = require('./matchEngine.js')
const writeMatchesFile = require('./writeMatchesToFile.js')

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

  // `people` is `users` keyed by id.
  const people = []
  users.map(({ id, ...rest }) => people[id] = formatUserFields(rest))

  // Rank matches according to people's preferences.
  let { compositeScore, subScores } = matchEngine(people)

  // Write matches to file, along with prefs and subscores.
  writeMatchesFile({
    people,
    matches: compositeScore,
    scores: subScores,
    fileName: MATCH_GRAPH_FILE,
  })

  return matches
}