const fs = require('fs')
const adaloApi = require('../adaloApi.js')
const { deepCopy } = require('../utils.js')
const formatUserFields = require('../formatUserFields.js')
const removeProspects = require('./removeProspects.js')
const prospectEngine = require('./prospectEngine.js')
const writeProspectsFile = require('./writeProspectsFile.js')

module.exports = runProspectEngine

/* 
 * Test and run here
 */
const PROSPECT_GRAPH_FILE = './csvs/Prospects (all positive).csv'
const refresh = false

runProspectEngine({ fileName: PROSPECT_GRAPH_FILE, refresh })
/* 
 */

async function runProspectEngine({ fileName, refresh }) {
  console.log(`Starting Prospect Engine...`)
  // Get collections.
  let users;
  // refresh=false is for testing and debugging because downloading
  // the collections from Adalo is slow.
  if (refresh) {
    console.log(`Loading Users collection from Adalo`)
    users = await adaloApi.get('Users')
    fs.writeFile('./csvs/Users (prospects).json', JSON.stringify(users), err => {if (err) return console.log(err)})
  } else {
    console.log(`Loading Users collection from local storage`)
    users = JSON.parse(fs.readFileSync('./csvs/Users (prospects)).json', 'utf8'))
  }

  // `people` is `users` keyed by id.
  const people = []
  users.map(({ id, ...rest }) => people[id] = formatUserFields(rest))

  // Rank prospects according to people's preferences.
  let prospectsByPreference = prospectEngine(people)

  // Deep copy `prospectsByPreference`.
  let prospects = deepCopy(prospectsByPreference)

  // Remove people who someone has already liked, nexted or dated.
  let { prospects, relationship: dated } =
    removeProspects({ prospects, people, relationship: 'dated' })
  let { prospects, relationship: liked } =
    removeProspects({ prospects, people, relationship: 'liked' })
  let { prospects, relationship: nexted } =
    removeProspects({ prospects, people, relationship: 'nexted' })

  // Save matches to file.
  writeProspectsFile({ people, prospectsByPreference, prospects, dated, liked, nexted }, fileName)

  // Post prospects to Adalo.
  /*
  Object.keys(prospects).map(id => {
    adaloApi.update('Users', id, { prospects: Object.keys(prospects[id])})
  })
  */

  return trimmedProspects
}