/*
SET THESE PARAMS
*/
const ROUND_ID = 4
const DAY = 20201209
const HOUR = 19
const SLOT = 0
const RERUN = false

// Libraries.
const adaloApi = require('../adaloApi.js')

// No need to set these params.
const TODAYS_DATES_FILE = `Dates ${DAY}.csv`
const errf = err => {if (err) return console.log(err)}

// Date Engine: get current Round.Here
const round = await adaloApi.get('Rounds', ROUND_ID)
let idsOfUsersHere = round.Here

// Download Users Here (or load Users and filter to Here).
let users, usersHere
let usersUpdated = false
try {
  usersHere = await Promise.all(idsOfUsersHere.map(id => adaloApi.get('Users', id)))
  console.log(`Downloading Users here SUCCEEDED.`)
  usersUpdated = true
  // fs.writeFile(`./csvs/Users (${DAY}).json`, JSON.stringify(usersHere), errf)

} catch (e) {
  console.warn(e)
  console.log(`Downloading Users here FAILED... loading from local storage.`)
  usersUpdated = false
  users = JSON.parse(fs.readFileSync(`./csvs/Users (${DAY}).json`, 'utf8'))
  usersHere = users.filter(u => idsOfUsersHere.includes(u.id))
}

// If slot rerun, filter for people who are Free.
if (RERUN) usersHere = usersHere.filter(u => u.Free)

// Prioritize Users Here in some way (wait start time, posivibes...)
usersHere = sortByPriority(usersHere)

// Load today's dates in case Users were loaded instead of downloaded.
// Make sure Users have recorded who they dated today.
let todaysDateGraph = loadDateGraph(TODAYS_DATES_FILE)
usersHere = updateUsersForTodaysDates(usersHere, todaysDateGraph)

/*
Match Users Here in some way:
Key graphs by user id.
*/
// Preference match can be precomputed <-[0,5]
let preferenceMatches = matchEngine(usersHere)

// Like, Next and Date adjustments can be made.
// Like can boost from max 5 to max 10.
// Next can reduce from max 5 to max 3.
// Date can reduce to 0.
let matches = adjustMatches(preferenceMatches, usersHere)


// Make dates for them in this priority order.
let { dates, idsOfPeopleWithDates } = dateEngine(usersHere, matches)

// Then revise the priority order (maybe by updating wait start time).
// This will get updated in the live db, but in case it cant be loaded.
usersHere.forEach(u => {
  if (idsOfPeopleWithDates.includes(u.id)) resetWaitTime(u)
})

// Save any updates to local copy of Users (eg Free, Wait Start Time)

// Add Daily rooms to Dates.
// Post Dates.