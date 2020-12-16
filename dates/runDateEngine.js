/*
SET THESE PARAMS
*/
let ROUND_ID = 10
let DAY = 20201214
let HOUR = 19
let SLOT = 0
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
// Libraries.
const adaloApi = require('../adaloApi.js')
const getSomeUsers = require('./getSomeUsers.js')

// No need to set these params.
let TODAYS_DATES_FILE = `Dates ${DAY}T${HOUR}.csv`
const fserr = err => {if (err) return console.log(err)}

runDateEngine()

async function runDateEngine() {

  // Date Engine: get current Round.Here
  const round = await adaloApi.get('Rounds', ROUND_ID)
  let idsOfUsersHere = round.Here
  console.log(`${idsOfUsersHere.length} people are Here.`)

  // Download Users Here (or load Users and filter to Here).
  let { usersHere, usersUpdated } = getSomeUsers(idsOfUsersHere, `./csvs/Users (${DAY}).json`)

  // If slot rerun, filter for people who are Free.
  // Make sure we actually got fresh data on who's free.
  if (RERUN && usersUpdated) usersHere = usersHere.filter(u => u.Free)

  // Prioritize Users Here in some way (wait start time, posivibes...)
  usersHere = sortByPriority(usersHere)

  // Load today's dates in case Users were loaded instead of downloaded.
  // Make sure Users have recorded who they dated today.
  usersHere = updateUsersForTodaysDates(usersHere, TODAYS_DATES_FILE)

  // Match Users Here
  console.log(`Matching people in real-time.`)
  let { compositeScore: matches } = matchEngine(usersHere)

  // Make dates for them in the order they are sorted.
  console.log(`Finding dates for people.`)
  let dates = dateEngine(usersHere, matches)
  console.log(`${dates.length} dates created.`)

  if (dates.length > 0) {

    // Add Daily rooms to Dates.
    console.log(`Adding Daily rooms to Dates...`)
    const params = { DAY, HOUR, SLOT, TIMEZONE_OFFSET, SLOT_LENGTH, SLOT_PREENTRY, SLOT_STARTS, SLOT_ENDS }
    await Promise.all(dates.forEach(date => addDailyRoom(date, params)))

    // Post the dates to Adalo.
    console.log(`Uploading dates to Adalo...`)
    let responses = await Promise.all(dates.map(date => postDateToAdalo(date)))
    console.log(`Dates created: ${responses.map(r=>r.statusText)}`)

    // Save Dates locally.
    writeDatesFile([...todaysDates, ...dates], DATES_FILE)

  } else {
    console.log(`No dates created. Exiting`)
  }
}
