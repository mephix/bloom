const getUsers = require('./getUsers.js')
const formatUserFields = require('../formatUserFields.js')
const prospectEngine = require('./prospectEngine.js')
const writeScoresToFile = require('../scores/writeScoresToFile.js')

module.exports = runProspectEngine

/* 
 * Test and run here
 */
const PROSPECT_GRAPH_FILE = './csvs/Prospects (all positive).csv'
const USER_LOCAL_FILE = './csvs/Users (prospects).json'
const refresh = false

runProspectEngine()

async function runProspectEngine() {
  console.log(`Starting Prospect Engine...`)
  // Get Users. refresh=false is for testing and debugging
  // because downloading the collections from Adalo is slow.
  let users = getUsers({ refresh, fileName: USER_LOCAL_FILE })

  // `people` is `users` keyed by id.
  const people = []
  users.map(({ id, ...rest }) => people[id] = formatUserFields(rest))

  // Rank prospects according to people's preferences.
  let { score, subScores } = prospectEngine(people)

  // // Deep copy `prospectsByPreference`.
  // let prospects = deepCopy(prospectsByPreference)

  // // Remove people who someone has already liked, nexted or dated.
  // let { prospects, relationship: dated } =
  //   removeProspects({ prospects, people, relationship: 'dated' })
  // let { prospects, relationship: liked } =
  //   removeProspects({ prospects, people, relationship: 'liked' })
  // let { prospects, relationship: nexted } =
  //   removeProspects({ prospects, people, relationship: 'nexted' })

  // Write prospects to file, along with prefs and subscores.
  writeScoresToFile({
    people,
    score,
    subScores,
    fileName: PROSPECT_GRAPH_FILE,
  })

  // Post prospects to Adalo.
  /*
  Object.keys(prospects).map(id => {
    adaloApi.update('Users', id, { prospects: Object.keys(prospects[id])})
  })
  */

  return prospects
}