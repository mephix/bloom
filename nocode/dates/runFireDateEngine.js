/*
 * SET THESE PARAMS
 */
let DAY = '2021-06-23'
let HOUR = '16'
let SLOT = 11
let DURING_SLOT = false   // If running during the slot, only match free people.
                        // If running before the slot, match everyone.
let useTestIds = true   // `false` for real rounds.

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

// Dependencies.
const firestoreApi = require('../apis/firestoreApi.js')
const db = firestoreApi.db
// const fs = require('fs')
// const addAdaloProfile = require('../users/addAdaloProfile.js')
const setProfileDefaults = require('../users/setProfileDefaults.js')
// const addTodaysDates = require('../users/addTodaysDates.js')
const sortByFirePriority = require('../users/sortByFirePriority.js')
const matchEngine = require('../matches/matchEngine.js')
const subsetScores = require('../scores/subsetScores.js')
const fireDateEngine = require('./fireDateEngine.js')
const fireDisplayPretty = require('./fireDisplayPretty.js')
const addRoom = require('../rooms/addRoom.js')
const { readCsv, writeToCsv } = require('../utils/csv.js')
const postDatesToFirebase = require('./postDatesToFirebase.js')

// No need to set these params.
let TODAYS_DATES_FILE = `./nocode/output/Dates ${DAY}T${HOUR}.csv`
// let TODAYS_USERS_FILE = `./nocode/output/Users ${DAY}.json`

runFireDateEngine()

async function runFireDateEngine() {

  // Get users here.
  let docs
  if (useTestIds) {
    // A real round should always use this option.
    let querySnapshot = await db.collection('Users-dev').where('here', '==', true).get()
    docs = querySnapshot.docs
  } else {
    // Only use this option for testing.
    testIds = [
      'xupkN6qW4DPw0G2Xk2oIzFqnwZt1', // who?
      'j4tshEWQaoW7qj5GqR60GmS2hOi1', // who?
    ]
    docs = await Promise.all(testIds.map((id => db.collection(collection).doc(id).get())))
  }
  let usersHere = docs.map(doc => { return { id: doc.id, ...doc.data() } })

  // Filter out users who are finished.
  usersHere = usersHere.filter(u => !u.finished)
  if (usersHere) {
    console.log(`${usersHere.length} people are Here:`)
    console.log(`${usersHere.map(u => u.firstName).join(', ')}`)
  }

  // Fill in missing profile fields with best guesses.
  // !! FIX THIS LATER !!
  usersHere = usersHere.map(setProfileDefaults)

  // !! add Dated, Liked and Nexted !!

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
  let { score, subScores } = matchEngine(usersHere)
  matches = subsetScores(score, { above: CUTOFF })

  // Find dates for Users.
  console.log(`Finding dates for people.`)
  let dates = fireDateEngine(usersHere, matches)
  fireDisplayPretty(dates, usersHere)

  if (dates.length > 0) {

    // Add videochat Rooms to Dates.
    console.log(`Adding Daily rooms to Dates...`)
    const params = { DAY, HOUR, SLOT, TIMEZONE_OFFSET, SLOT_PREENTRY, SLOT_STARTS, SLOT_ENDS }
    await Promise.all(dates.map(date => addRoom(date, params)))

    // Save the Dates locally
    let existingDates = readCsv(TODAYS_DATES_FILE)
    writeToCsv([...existingDates, ...dates], TODAYS_DATES_FILE)

    // Post the Dates to Firebase.
    await postDatesToFirebase(dates)
    
  } else {

    console.log(`No dates created. Exiting`)
    
  }
}
