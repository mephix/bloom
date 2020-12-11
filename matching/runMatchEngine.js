const fs = require('fs')
const adaloApi = require('./adaloApi.js')
const formatUserFields = require('./formatUserFields.js')
const getInviteGraph = require('./getInviteGraph.js')
const adjustMatchesForInvites = require('./adjustMatchesForInvites.js')
const getDateGraph = require('./getDateGraph.js')
const adjustMatchesForDates = require('./adjustMatchesForDates.js')
const matchEngine = require('./matchEngine.js')
const { writeMatchesFile } = require('./handleMatchesFile.js')

module.exports = runMatchEngine

/* 
 * Test and run here
 */
const MATCH_GRAPH_FILE = './csvs/Matches (all positive).csv'
const refresh = false

runMatchEngine({ fileName: MATCH_GRAPH_FILE, refresh })
/* 
 */

async function runMatchEngine({ fileName, refresh }) {
  console.log(`Starting Match Engine...`)
  // Get collections.
  let users; let dates; let invites;
  // refresh=false is for testing and debugging because downloading
  // the collections from Adalo is slow.
  if (refresh) {
    console.log(`Loading Users, Dates and Invites collections from Adalo`)
/* 
 * Test and run here
 */
    // !! temporarily run them one at a time due to 503 error !!!
    users = await adaloApi.get('Users')
    dates = await adaloApi.get('Dates')
    invites = await adaloApi.get('Invites')
    /*
    [users, dates, invites] = await Promise.all([
      adaloApi.get('Users'),
      adaloApi.get('Dates'),
      adaloApi.get('Invites'),
    ])
    */

    const errf = err => {if (err) return console.log(err)}
    fs.writeFile('./csvs/Users (tmp).json', JSON.stringify(users), errf)
    fs.writeFile('./csvs/Dates (tmp).json', JSON.stringify(dates), errf)
    fs.writeFile('./csvs/Invites (tmp).json', JSON.stringify(invites), errf)
  } else {
    console.log(`Loading Users, Dates and Invites collections from local storage`)
    users = JSON.parse(fs.readFileSync('./csvs/Users 1644 (ids added).json', 'utf8'))
    dates = JSON.parse(fs.readFileSync('./csvs/Dates (tmp).json', 'utf8'))
    invites = JSON.parse(fs.readFileSync('./csvs/Invites (tmp).json', 'utf8'))
  }

  const people = users.map(formatUserFields)
  const usersById = []
  people.map(({ id, ...rest }) => usersById[id] = rest)

  // Convert to graphs.
  const inviteGraph = getInviteGraph(invites, usersById)
  const dateGraph = getDateGraph(dates, usersById)

  // Get preference-based matches.
  const preferenceMatchGraph = matchEngine(people)

  // Adjust preference-based matches for invites and dates.
  const inviteAdjustedGraph = adjustMatchesForInvites(preferenceMatchGraph, inviteGraph, usersById)
  const finalGraph = adjustMatchesForDates(inviteAdjustedGraph, dateGraph, usersById)

  // Save matches to file.
  writeMatchesFile(finalGraph, fileName)

  return finalGraph
}