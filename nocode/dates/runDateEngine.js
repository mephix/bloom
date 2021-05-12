/*
SET THESE PARAMS
*/
let DAY = '2021-05-11'
let HOUR = 16
let SLOT = 2
let RERUN = false
let CUTOFF = 0.00       // >0 makes the dateEngine more picky.
let useTestIds = false   // `false` for real rounds.

// `seqOrPar` should be "parallel" unless there is a dire 503 error when
// posting dates to Adalo. In that case, change it to to "sequential".
let seqOrPar = 'parallel' // 'sequential' // 

// Less frequently changed params:
let ROUND_ID = 1
const TIMEZONE_OFFSET = '-07:00'
const SLOT_PREENTRY = 1
const SLOT_STARTS = {
  0:  HOUR + ':00',
  1:  HOUR + ':05',
  2:  HOUR + ':10',
  3:  HOUR + ':16',
  4:  HOUR + ':22',
  5:  HOUR + ':28',
  6:  HOUR + ':34',
  7:  HOUR + ':40',
  8:  HOUR + ':46',
  9:  HOUR + ':52',
}
const SLOT_ENDS = {
  0:  HOUR + ':05',
  1:  HOUR + ':10',
  2:  HOUR + ':16',
  3:  HOUR + ':22',
  4:  HOUR + ':28',
  5:  HOUR + ':34',
  6:  HOUR + ':40',
  7:  HOUR + ':46',
  8:  HOUR + ':52',
  9:  HOUR + ':59',
}
// Dependencies.
const adaloApi = require('../apis/adaloApi.js')
const fs = require('fs')
const setProfileDefaults = require('../users/setProfileDefaults.js')
const addTodaysDates = require('../users/addTodaysDates.js')
const sortByPriority = require('../users/sortByPriority.js')
const matchEngine = require('../matches/matchEngine.js')
const subsetScores = require('../scores/subsetScores.js')
const dateEngine = require('./dateEngine.js')
const displayPretty = require('./displayPretty.js')
const addRoom = require('../rooms/addRoom.js')
const postDates = require('./postDates.js')
const { writeToCsv } = require('../utils/csv.js')

// No need to set these params.
let TODAYS_DATES_FILE = `./nocode/output/Dates ${DAY}T${HOUR}.csv`
let TODAYS_USERS_FILE = `./nocode/output/Users ${DAY}.json`

runDateEngine()

async function runDateEngine() {

  // Get users here.
  let idsOfUsersHere
  if (useTestIds) {
    // Only use this option for testing.
    idsOfUsersHere = [3,4] // [1052,1051,1050,1049,1081,1080,1076,1075,]
    // "id":4,"Email":"amel.assioua@gmail.com","First Name":"Amel"
    // "id":836,"Email":"female_straight_25_SF@bloom.com","First Name":"Anastasia"
    // "id":837,"Email":"female_straight_33_LA@bloom.com","First Name":"Christine"
  } else {
    // A real round should always use this option.
    const round = await adaloApi.get('Rounds', ROUND_ID)
    idsOfUsersHere = round.Here || []
  }
  if (idsOfUsersHere) console.log(`${idsOfUsersHere.length} people are Here.`)

  // Load Users, filter for those who are Here, and note that Users were
  // not updated (ie, downloaded live from Adalo).
  let usersUpdated = false
  let users = JSON.parse(fs.readFileSync(TODAYS_USERS_FILE, 'utf8'))
  let usersHere = users.filter(u => idsOfUsersHere.includes(u.id))

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
  console.log(`\n${dates.length} dates created.`)
  console.log(``)
  displayPretty(dates, usersHere)
  console.log(`${dates.length} dates created.`)

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
