/*
SET THESE PARAMS
*/
let DAY = '2021-04-08'
let HOUR = '10'
let SLOT = 9
let RERUN = false        // Only do reruns after the slot starts.
let CUTOFF = 0.00       // >0 makes the dateEngine more picky.
let useTestIds = true   // `false` for real rounds.

// Less frequently changed params.
// Timezone offset switches between 07:00 and 08:00 with daylight saving.
const TIMEZONE_OFFSET = '-07:00'
// let ROUND_ID = 1
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
const fs = require('fs')
const addAdaloProfile = require('../users/addAdaloProfile.js')
const setProfileDefaults = require('../users/setProfileDefaults.js')
const addTodaysDates = require('../users/addTodaysDates.js')
const sortByPriority = require('../users/sortByPriority.js')
const matchEngine = require('../matches/matchEngine.js')
const subsetScores = require('../scores/subsetScores.js')
const dateEngine = require('./dateEngine.js')
const displayPretty = require('./displayPretty.js')
const addRoom = require('../rooms/addRoom.js')
const { writeToCsv } = require('../utils/csv.js')
const postDateToFirebase = require('./postDateToFirebase.js')
const consoleColorLog = require('../utils/consoleColorLog.js')

// No need to set these params.
let TODAYS_DATES_FILE = `./nocode/output/Dates ${DAY}T${HOUR}.csv`
let TODAYS_USERS_FILE = `./nocode/output/Users ${DAY}.json`

runFireDateEngine()

async function runFireDateEngine() {

  // Get users here.
  let querySnapshot
  let docs
  if (useTestIds) {
    // Only use this option for testing.
    const emails = [
      'john.prins@gmail.com',
      'amel.assioua@gmail.com',
    ] 
    // "id":4,"Email":"amel.assioua@gmail.com","First Name":"Amel"
    // "id":836,"Email":"female_straight_25_SF@bloom.com","First Name":"Anastasia"
    // "id":837,"Email":"female_straight_33_LA@bloom.com","First Name":"Christine"
    docs = await Promise.all(emails.map(e => db.collection('Users').doc(e).get()))
  } else {
    // A real round should always use this option.
    querySnapshot = await db.collection('Users').where('here', '==', true).get()
    docs = querySnapshot.docs
  }
  let usersHere = docs.map(doc => {
    return { id: doc.id, ...doc.data() }
  })
  if (usersHere) console.log(`${usersHere.length} people are Here.`)

  // Connect people to their Adalo profiles.
  let usersInAdalo = JSON.parse(fs.readFileSync(TODAYS_USERS_FILE, 'utf8'))
  let idsOfUsersHere = usersHere.map(u => u.id)
  let usersInAdaloHere = usersInAdalo.filter(u => idsOfUsersHere.includes(u.Email))
  usersHere = usersHere.map(u => addAdaloProfile(u, usersInAdaloHere.filter(v => v.Email === u.id)))

  // Fill in missing profile fields with best guesses.
  usersHere = usersHere.map(setProfileDefaults)

  // Load today's dates in case Users were loaded locally.
  // Today's dates file saved locally will avoid double-dates.
  // Updates Start Time of users who had a date.
  // Set people who have a date already in this slot to Not-Free
  // (regardless of whether they left it early and became free again).
  let notFreeSlot = SLOT // usersUpdated ? -1 : SLOT
  let todaysDates
  [usersHere, todaysDates] = addTodaysDates(usersHere, TODAYS_DATES_FILE, notFreeSlot)

  // During reruns, filter out people who aren't free.
  // This will be people who are actually in a date, plus anyone who was in
  // a date during this slot already. So they can't get a second date in
  // the slot.
  // This means we *dont* want to do a rerun before the slot starts (as
  // people will be not free due to their date in the current slot).
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
  console.log(``)

  if (dates.length > 0) {

    // Add videochat Rooms to Dates.
    console.log(`Adding Daily rooms to Dates...`)
    const params = { DAY, HOUR, SLOT, TIMEZONE_OFFSET, SLOT_PREENTRY, SLOT_STARTS, SLOT_ENDS }
    await Promise.all(dates.map(date => addRoom(date, params)))

    // Save the Dates locally
    writeToCsv([...todaysDates, ...dates], TODAYS_DATES_FILE)

    // Post the Dates to Firebase.
    const rs = await Promise.all(dates.map(date => postDateToFirebase(date)))
    const wts = rs[rs.length-1].map(r => r.writeTime.toDate())
    const wt = `${wts[0].getHours()}:${wts[0].getMinutes()}`
    consoleColorLog(`${rs.length} dates posted to Firebase at ${wt}`, 'green', 'bold')
    
  } else {
    console.log(`No dates created. Exiting`)
  }
}
