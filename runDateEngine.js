const fs = require('fs')
const { readMatchesFile } = require('./handleMatchesFile.js')
const makeSymmetric = require('./makeSymmetric.js')
const formatUserFields = require('./formatUserFields.js')
const { readDatesFile, writeDatesFile } = require('./handleDatesFile.js')
const adjustMatchesForDates = require('./adjustMatchesForDates.js')
const math = require('mathjs')
const subsetMatchList = require('./subsetMatchList.js')
const dateEngine = require('./dateEngine.js')
const makeDateForAdalo = require('./makeDateForAdalo.js')
const adaloApi = require('./adaloApi.js')
// const getDateGraph = require('./getDateGraph.js')

// This week's parameters:
// What date is it?
// How many date slots do we have?
let MATCH_GRAPH_FILE = './csvs/Matches (all positive).csv' // './csvs/Bloom - Match Scores - 1109.csv'
// let NO_DATES_FILE = './csvs/Bloom - People with No Dates - 1123.csv'
let DATES_FILE = './csvs/DATES 20201207.csv'
const DAY = '2020-12-07'

/* CHANGE */
const HOUR = '18'
const refresh = false
const SLOTS = [0] // 0, 1, 2, 3, 4, 5,
const IS_SLOT_RERUN = false
const backup_use_Round_for_Here = true

// Run the Date Engine.
runDateEngine({ refresh })

async function runDateEngine({ refresh }) {
  // !! `SLOTS[0]` may need to be changed !!
  console.log(`Running date engine for ${DAY}T${HOUR}:${SLOTS[0]}0 ...`)
  
  // Get Users.
  let users
  if (refresh) {
    try {
      console.log(`Getting Users collection from Adalo...`)
      users = await adaloApi.get('Users')
      const errf = err => {if (err) return console.log(err)}
      fs.writeFile('./csvs/Users (tmp).json', JSON.stringify(users), errf)
    } catch (e) {
      console.log(`Error getting Users. Reverting to loading Users collection from local storage...`)
      users = JSON.parse(fs.readFileSync('./csvs/Users (ids added).json', 'utf8'))  
    }
  } else {
    console.log(`Loading Users collection from local storage...`)
    users = JSON.parse(fs.readFileSync('./csvs/Users (ids added).json', 'utf8'))
  }

  // Load up the Match list (output of the Match Engine).
  // makeSymmetric enforces symmetry on the matchGraph scores.
  // So that they measure the goodness of the match between the two people.
  console.log(`Loading match list from ${MATCH_GRAPH_FILE}`)
  let matchGraph = readMatchesFile(MATCH_GRAPH_FILE)
  matchGraph = makeSymmetric(matchGraph)

  // Format users.
  const people = users.map(formatUserFields)
  const usersById = []
  people.map(({ id, ...rest }) => usersById[id] = rest)

  // BACKUP: Get who's here from the Round.
  if (backup_use_Round_for_Here) {
    let rounds = await adaloApi.get('Rounds')
    let activeRounds = rounds.filter(r => r.Active)
    console.log(`found ${activeRounds.length}.`)
    let here = activeRounds[0].Here
    console.log(`Users Here: ${here}`)
    // Set these people to here
    people.forEach(p => {
      if (here.includes(p.id)) {
        p.here = true
        p.free = true
      } else {
        p.here = false
      }
    })
  }

  // See who's here and free (or for future slot, just here).
  let peopleHere
  if (IS_SLOT_RERUN) {
    peopleHere = people.filter( p => p.here && p.free)
    console.log(`Seeing who's here and free... found ${peopleHere.length} people`)
  } else {
    peopleHere = people.filter( p => p.here)
    console.log(`Seeing who's here for next round... found ${peopleHere.length} people`)
  }

  // Load dates from today. Exclude people who have a date in this slot already.
  const todaysDates = readDatesFile(DATES_FILE)
  let todaysDatesGraph = {}
  let emailsOfPeopleToExclude = []
  todaysDates.map(({ email1, email2, slot }) => {
    todaysDatesGraph[email1] = { [email2]: slot }
    // Note people who have a date in this slot already.
    if (Number(slot) === SLOTS[0]) {
      emailsOfPeopleToExclude.push(email1)
      emailsOfPeopleToExclude.push(email2)
    }
  })
  // Exclude people with a date in this slot already.
  peopleUnmatched = peopleHere.filter(p => 
    !emailsOfPeopleToExclude.includes(p.email)
  )

  // Adjust match list for dates from today.
  matchGraph = adjustMatchesForDates(matchGraph, todaysDatesGraph, usersById)

  // Prioritize who's here.
  const timeNow = new Date()
  peopleUnmatched.map(p => {
    // Convert time diff to minutes.
    if (!p.checkInTime) console.warn(`${p.name} is Here and Free but has no check in time.`)
    const milliseconds = p.checkInTime
      ? timeNow - new Date(p.checkInTime)
      : 0
    const minutes = milliseconds/1000/60
    // Cap wait times <- [0,10] minutes for later conversion to score.
    p.waitTime = math.max(0, math.min(10, minutes))
    // Multiplying wait and posivibes scores <-[0,1] yields the composite score.
    p.priority = p.waitTime/10 * p.posivibes/10
  })
  peopleUnmatched.sort((a,b) => (b.priority - a.priority))

  // subset the Match list to who's here.
  // Get it in the form of a matrix for each date slot.
  // This matrix explicitly uses the order in which `peopleUnmatched` is sorted.
  let Ms = subsetMatchList( matchGraph, peopleUnmatched, SLOTS.length )

  // Use the Match list to create Dates for who's here.
  console.log(`Creating dates in slots ${SLOTS} for the ${peopleUnmatched.length} people checked in...`)
  let { dates } = dateEngine(peopleUnmatched, Ms, SLOTS)
  console.log(`${dates.length} dates created.`)

  /* TEMP  !!fordebugging */
  // dates = dates.slice(0,5)

  if (dates.length > 0) {
    // Make the Dates for Adalo.
    // This fn also updates `dates`.
    console.log(`Formatting dates for Adalo...`)
    let adaloDates = await Promise.all(dates.map(date =>
      { return makeDateForAdalo(DAY, HOUR, date) }
    ))

    // Append new dates to today's existing dates.
    writeDatesFile([...todaysDates, ...dates], DATES_FILE)

    // Upload the dates to Adalo
    console.log(`Uploading dates to Adalo...`)
    // !! slice is for DEBUGGING ONLY !!
    let datesToUpload = adaloDates // .slice(0,2)

    let responses = await Promise.all(datesToUpload.map(date =>
      adaloApi.create('Dates', date)  
    ))
    console.log(`Dates created: ${responses.map(r=>r.statusText)}`)
  } else {
    console.log(`No dates created. Exiting`)
  }
}