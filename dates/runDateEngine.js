/*
SET THESE PARAMS
*/
let ROUND_ID = 1
let DAY = '2020-12-20'
let HOUR = 21
let SLOT = 5
let RERUN = false

// Less frequently changed params:
// timezone, slot length, preentry, starts and ends.
const TIMEZONE_OFFSET = '-08:00'
const SLOT_LENGTH = 8
const SLOT_PREENTRY = 2
const SLOT_STARTS = {
  0: HOUR + ':02',
  1: HOUR + ':10',
  2: HOUR + ':18',
  3: HOUR + ':26',
  4: HOUR + ':34',
  5: HOUR + ':42',
}
const SLOT_ENDS = {
  0: HOUR + ':10',
  1: HOUR + ':18',
  2: HOUR + ':26',
  3: HOUR + ':34',
  4: HOUR + ':42',
  5: HOUR + ':50',
}
// Dependencies.
const adaloApi = require('../adaloApi.js')
const getSomeUsers = require('../users/getSomeUsers.js')
const setProfileDefaults = require('../users/setProfileDefaults.js')
const addTodaysDates = require('../users/addTodaysDates.js')
const sortByPriority = require('../users/sortByPriority.js')
const matchEngine = require('../matches/matchEngine.js')
const dateEngine = require('./dateEngine.js')
const addRoom = require('./addRoom.js')
const postDateToAdalo = require('./postDateToAdalo.js')
const { writeToCsv } = require('../csv.js')

// No need to set these params.
let TODAYS_DATES_FILE = `./csvs/Dates ${DAY}T${HOUR}.csv`

runDateEngine()

async function runDateEngine() {

  // Get users here in this round.
  const round = await adaloApi.get('Rounds', ROUND_ID)
  let idsOfUsersHere = round.Here
  console.log(`${idsOfUsersHere.length} people are Here.`)

  // Download Users Here (or load Users and filter to Here).
  let { usersHere, usersUpdated } = await getSomeUsers(idsOfUsersHere,
    `./csvs/Users (ids added).json`)
  // let { usersHere, usersUpdated } = await getSomeUsers(idsOfUsersHere, `../csvs/Users (${DAY}).json`)
  usersHere = usersHere.map(setProfileDefaults)

  // If slot rerun, filter for people who are Free.
  // Make sure we actually got fresh data on who's free.
  if (RERUN && usersUpdated) usersHere = usersHere.filter(u => u['Free'])

  // Load today's dates in case Users were loaded instead of downloaded.
  // Make sure Users have recorded who they dated today.
  // Updates Wait Start Time of users with a date.
  let todaysDates
  [ usersHere, todaysDates] = addTodaysDates(usersHere, TODAYS_DATES_FILE)

  // Prioritize Users Here in some way (wait start time, posivibes...)
  usersHere = sortByPriority(usersHere)

  // Match Users Here
  console.log(`Matching people in real-time.`)
  let { score: matches, subScores } = matchEngine(usersHere)

  // Make dates for them in the order they are sorted.
  console.log(`Finding dates for people.`)
  let dates = dateEngine(usersHere, matches)
  console.log(`${dates.length} dates created.`)

  if (dates.length > 0) {

    // Add videochat Rooms to Dates.
    console.log(`Adding Daily rooms to Dates...`)
    const params = { DAY, HOUR, SLOT, TIMEZONE_OFFSET, SLOT_LENGTH, SLOT_PREENTRY, SLOT_STARTS, SLOT_ENDS }
    await Promise.all(dates.map(date => addRoom(date, params)))

    // Save the Dates locally.
    // Used to use `writeDatesFile`.
    writeToCsv([...todaysDates, ...dates], TODAYS_DATES_FILE)

    // Post the Dates to Adalo.
    console.log(`Uploading dates to Adalo...`)
    let adaloPostPromises = dates
      .map(date => postDateToAdalo(date, params))
      // Flatten out the pairs of dates generated.
      .reduce((t, c) => t.concat(c), [])

    // Report on success of posting dates to Adalo.
    let responses = await Promise.all(adaloPostPromises)
    console.log(`Date creation statuses: ${responses.map(r=>r.statusText)}`)

  } else {
    console.log(`No dates created. Exiting`)
  }
}
