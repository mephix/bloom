/*
 * SET THESE PARAMS
 */
let DAY = '2021-07-01'
let HOUR = '14'
let SLOT = 9
let DURING_SLOT = true  // If running during the slot, only match free people.
                        // If running before the slot, match everyone.
let useTestIds = true  // `false` for real rounds.

let UPDATE_LIKES_LIVE = true

// Give people a second chance on dates that didn't actually work.
let ONLY_COUNT_DATES_THEY_BOTH_JOINED = false

// Use the local dates file as a safeguard.
let UPDATE_DATED_FROM_OUTPUT_FILE = true

// Matches are scored 0-100.
let CUTOFF = 0

/*
 * Length of dates.
 * Timezone offset switches between 07:00 and 08:00 with daylight saving.
 */
const TIMEZONE_OFFSET = '-07:00'
const SLOT_PREENTRY = 1
const SLOT_STARTS = {
  0:  HOUR + ':00',
  1:  HOUR + ':05',
  2:  HOUR + ':10',
  3:  HOUR + ':15',
  4:  HOUR + ':20',
  5:  HOUR + ':25',
  6:  HOUR + ':30',
  7:  HOUR + ':35',
  8:  HOUR + ':40',
  9:  HOUR + ':45',
  10: HOUR + ':50',
  11: HOUR + ':55',
}
const SLOT_ENDS = {
  0:  HOUR + ':05',
  1:  HOUR + ':10',
  2:  HOUR + ':15',
  3:  HOUR + ':20',
  4:  HOUR + ':25',
  5:  HOUR + ':30',
  6:  HOUR + ':35',
  7:  HOUR + ':40',
  8:  HOUR + ':45',
  9:  HOUR + ':50',
  10: HOUR + ':55',
  11: HOUR + ':59',
}
const params = { DAY, HOUR, SLOT, TIMEZONE_OFFSET, SLOT_PREENTRY, SLOT_STARTS, SLOT_ENDS }

// Dependencies.
const firestoreApi = require('../apis/firestoreApi.js')
const db = firestoreApi.db
const setFireProfileDefaults = require('../users/setFireProfileDefaults.js')
const addLikesNextsDatesLive = require('./addLikesNextsDatesLive.js')
const addLikesNextsDatesLocally = require('./addLikesNextsDatesLocally.js')
const sortByFirePriority = require('../users/sortByFirePriority.js')
const fireMapFieldNames = require('./fireMapFieldNames.js')
const fireMatchEngine = require('../matches/fireMatchEngine.js')
const subsetScores = require('../scores/subsetScores.js')
const fireDateEngine = require('./fireDateEngine.js')
const fireDisplayPretty = require('./fireDisplayPretty.js')
const { readCsv, writeToCsv } = require('../utils/csv.js')
const postDatesToFirebase = require('./postDatesToFirebase.js')
const consoleColorLog = require('../utils/consoleColorLog.js')

// No need to set these params.
let TODAYS_DATES_FILE = `./nocode/output/Dates ${DAY}T${HOUR}.csv`
// let TODAYS_USERS_FILE = `./nocode/output/Users ${DAY}.json`

runFireDateEngine()

async function runFireDateEngine() {

  // Get users here.
  let docs
  if (!useTestIds) {
    // A real round should always use this option.
    let querySnapshot = await db.collection('Users-dev').where('here', '==', true).get()
    docs = querySnapshot.docs
  } else {
    // Only use this option for testing.
    testIds = [
      'DItEowVmZMdMANWR4Q6E01v7SVv1', // Tasha
      'Kfo4fhNY9bfLoFdIMdmXNPu7UB22', // Andy
      // 'rENCRuRmF6gBxAQsS4E1qqna23L2', // Amel
      // '4IizDnXG2WfJsAT8gbZUDVL78S42', // John
    ]
    docs = await Promise.all(testIds.map((id => db.collection('Users-dev').doc(id).get())))
  }
  let usersHere = docs.map(doc => { return { id: doc.id, ...doc.data() } })

  // Filter out users who are finished.
  if (usersHere) {
    console.log(`Out of ${usersHere.length} people Here,`)
    usersHere = usersHere.filter(u => !u.finished)
    console.log(`${usersHere.length} people are Here and not finished:`)
    console.log(`${usersHere.map(u => u.firstName).join(', ')}`)
  }

  // Fill in missing profile fields with best guesses.
  usersHere = usersHere.map(setFireProfileDefaults)

  // add Dated, Liked and Nexted.
  if (UPDATE_LIKES_LIVE) {
    usersHere = await addLikesNextsDatesLive(db, usersHere, ONLY_COUNT_DATES_THEY_BOTH_JOINED)
  } else {
    usersHere = addLikesNextsDatesLocally(usersHere, DAY)
  }

  // As a backup, read dates already created during this date night from the csv file.
  let existingDates = readCsv(TODAYS_DATES_FILE)
  if (UPDATE_DATED_FROM_OUTPUT_FILE) {
    existingDates.forEach(d => {
      let userFor  = usersHere.filter(u => u.id === d.for)[0]
      let userWith = usersHere.filter(u => u.id === d.with)[0]
      if (userFor) userFor.dated ? userFor.dated.push(d.with) : userFor.dated = [d.with]
      if (userWith) userWith.dated ? userWith.dated.push(d.for) : userWith.dated = [d.for]
    })
  }

  // If running during the slot, filter for only people who are free.
  // These will be people who are already in a date.
  // This means we *dont* want to filter this way if running before the slot starts.
  // (as people will be not free due to their date in the current slot).
 if (DURING_SLOT) {
    console.log(`Out of ${usersHere.length} people Here,`)
    usersHere = usersHere.filter(u => u.free)
    console.log(`${usersHere.length} people are Free.`)
  }

  // Prioritize Users (by waitStartTime and posivibes).
  console.log(`Prioritizing people.`)
  usersHere = sortByFirePriority(usersHere)
  
  // Find matches for Users.
  // (keep subScores so we can inspect them).
  console.log(`Matching people.`)
  let usersHereOldFieldNames = fireMapFieldNames(usersHere)
  let { score, subScores } = fireMatchEngine(usersHereOldFieldNames)
  matches = subsetScores(score, { above: CUTOFF })

  // Find dates for Users.
  console.log(`Finding dates for people.`)
  let usersById = {}
  usersHere.map(({ id, ...data }) => usersById[id] = data)
  let dates = fireDateEngine(usersById, matches)
  fireDisplayPretty(dates, usersHere)

  if (dates.length > 0) {
    // Save the Dates locally
    writeToCsv([...existingDates, ...dates], TODAYS_DATES_FILE)

    // Post the Dates to Firebase.
    postDatesToFirebase(dates, params)
    
  } else {

    consoleColorLog(`No dates created. Exiting`, 'red')

  }
}
