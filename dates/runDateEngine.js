/*
SET THESE PARAMS
*/
let ROUND_ID = 1
let DAY = '2021-01-27'
let HOUR = 17
let SLOT = 4
let RERUN = false
// `cutoff` above zero will make the dateEngine more picky.
// Useful for later rounds.
let CUTOFF = 0.0
// `avoid503` can be set to true to avoid a 503 error.
// In this case it will only use the local backup of Users.
let avoid503 = true

// `seqOrPar` should be "parallel" unless there is a dire 503 error when
// posting dates to Adalo. In that case, change it to to "sequential".
let seqOrPar = 'parallel' // 'sequential' // 


// Less frequently changed params:
const TIMEZONE_OFFSET = '-08:00'
// const SLOT_LENGTH = 8
const SLOT_PREENTRY = 2
const SLOT_STARTS = {
  0: HOUR + ':02',
  1: HOUR + ':10',
  2: HOUR + ':18',
  3: HOUR + ':26',
  4: HOUR + ':34',
  5: HOUR + ':42',
  6: HOUR + ':50',
}
const SLOT_ENDS = {
  0: HOUR + ':10',
  1: HOUR + ':18',
  2: HOUR + ':26',
  3: HOUR + ':34',
  4: HOUR + ':42',
  5: HOUR + ':50',
  6: HOUR + ':58',
}
// Dependencies.
const adaloApi = require('../apis/adaloApi.js')
const getSomeUsers = require('../users/getSomeUsers.js')
const setProfileDefaults = require('../users/setProfileDefaults.js')
const addTodaysDates = require('../users/addTodaysDates.js')
const sortByPriority = require('../users/sortByPriority.js')
const matchEngine = require('../matches/matchEngine.js')
const subsetScores = require('../scores/subsetScores.js')
const dateEngine = require('./dateEngine.js')
const displayPretty = require('./displayPretty.js')
const addRoom = require('./addRoom.js')
const postDates = require('./postDates.js')
const { writeToCsv } = require('../csv.js')

// No need to set these params.
let TODAYS_DATES_FILE = `./csvs/Dates ${DAY}T${HOUR}.csv`
let TODAYS_USERS_FILE = `./csvs/Users ${DAY}.json`

runDateEngine()

async function runDateEngine() {

  // Get users here in this round.
  const round = await adaloApi.get('Rounds', ROUND_ID)
  /*
   * !! DEBUGGING ONLY !!!! 
   * WRITE A POSTIT WHEN USING THESE DEBUGGING IDS
   */
  // let idsOfUsersHere = [702,727,750,765,760,897] // 
  // let idsOfUsersHere = [3,4] // [1052,1051,1050,1049, 1081,1080,1076,1075,]
  let idsOfUsersHere = round.Here || []
  if (idsOfUsersHere) console.log(`${idsOfUsersHere.length} people are Here.`)

  // Download Users Here (or load Users and filter to Here).
  let { usersHere, usersUpdated } =
    await getSomeUsers(idsOfUsersHere, TODAYS_USERS_FILE, avoid503) //, method='sequential')
    
  // Filter out users with no profile.
  let uc = usersHere.length
  usersHere = usersHere.filter(u => u.profile)
  let nUsersRemoved = uc - usersHere.length
  if (nUsersRemoved > 0) {
    console.log(`Removed ${nUsersRemoved} users with no profile, reducing total number to ${usersHere.length}`)
  }

  // Fill in missing profile fields with best guesses.
  usersHere = usersHere.map(setProfileDefaults)

  // Load today's dates in case Users were loaded locally.
  // Today's dates file saved locally will avoid double-dates.
  // Updates Start Time of users who had a date.
  // If we don't have fresh data on who's free, set people who have a date
  // already in this slot to Not-Free.
  let notFreeSlot = usersUpdated ? -1 : SLOT
  let todaysDates
  [ usersHere, todaysDates] = addTodaysDates(usersHere, TODAYS_DATES_FILE, notFreeSlot)

  // During reruns, filter out people who aren't free.
  // Make sure, when we haven't got fresh data on users, we already set
  // people who have a date in this slot to not be free above.
 if (RERUN) {
    console.log(`Out of ${usersHere.length} people Here,`)
    usersHere = usersHere.filter(u => u['Free'])
    console.log(`${usersHere.length} people are Free.`)
  }

  // Prioritize Users Here in some way (wait start time, posivibes...)
  usersHere = sortByPriority(usersHere)
  // Match Users in real time.
  // Keep subScores so we can inspect them.
  console.log(`Matching people in real-time.`)
  let { score, subScores } = matchEngine(usersHere)
  matches = subsetScores(score, { above: CUTOFF })

  // Make dates for them in the order they are sorted.
  console.log(`Finding dates for people.`)
  let dates = dateEngine(usersHere, matches)
  console.log(`${dates.length} dates created.`)
  displayPretty(dates, usersHere)

  if (dates.length > 0) {

    // Add videochat Rooms to Dates.
    console.log(`Adding Daily rooms to Dates...`)
    const params = { DAY, HOUR, SLOT, TIMEZONE_OFFSET, SLOT_PREENTRY, SLOT_STARTS, SLOT_ENDS }
    await Promise.all(dates.map(date => addRoom(date, params)))

    // Save the Dates locally
    writeToCsv([...todaysDates, ...dates], TODAYS_DATES_FILE)

    // Post the Dates to Adalo.
    postDates(dates, seqOrPar, params)

  } else {
    console.log(`No dates created. Exiting`)
  }
}
