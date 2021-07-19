/*
 * Key parameters to set
 */
const today = '2021-07-19'

const filepath = `./nocode/output`
const dev = '-dev' // '' //

const consoleColorLog = require('../utils/consoleColorLog.js')
const getFireCollection = require('../db/getFireCollection.js')
const addLikesNextsDates = require('../dates/addLikesNextsDates.js')
const setFireProfileDefaults = require('../users/setFireProfileDefaults.js')
const fireMapFieldNames = require('../dates/fireMapFieldNames.js')
const fireMatchEngine = require('../matches/fireMatchEngine.js')
const subsetScores = require('../scores/subsetScores.js')
const fs = require('fs')
const fserr = err => {if (err) return console.log(err)}

runBroadcastMatchEngine()

async function runBroadcastMatchEngine() {
  consoleColorLog(`Starting Broadcast Match Engine...`)

  // Refresh firebase collections.
  consoleColorLog(`Downloading Firebase collections...`)
  let [users, likes, nexts, dates] = await Promise.all([
    getFireCollection('Users' + dev,  `${filepath}/firebase Users${dev} ${today}.json`),
    getFireCollection('Likes' + dev,  `${filepath}/firebase Likes${dev} ${today}.json`),
    getFireCollection('Nexts' + dev,  `${filepath}/firebase Nexts${dev} ${today}.json`),
    getFireCollection('Dates' + dev,  `${filepath}/firebase Dates${dev} ${today}.json`),
  ])

  // Add Likes, Nexts, Dates
  consoleColorLog(`Adding Likes, Nexts and Dates...`)
  const ONLY_COUNT_DATES_THEY_BOTH_JOINED = true
  users = addLikesNextsDates(users, likes, nexts, dates, ONLY_COUNT_DATES_THEY_BOTH_JOINED)

  // Fill in missing profile fields with best guesses.
  users = users.map(setFireProfileDefaults)

  // Convert to old field names in order to use computeSubScores.
  let usersOldFieldNames = fireMapFieldNames(users)

  // Make Matches.
  // Matches should be scored 0-100.
  consoleColorLog(`Making Matches...`)
  let CUTOFF = 1
  let { score, subScores } = fireMatchEngine(usersOldFieldNames)
  matches = subsetScores(score, { above: CUTOFF })

  // Output as JSON.
  const matchesFileName = `${filepath}/firebase Matches ${today}.json`
  fs.writeFile(matchesFileName, JSON.stringify(matches), fserr)
  consoleColorLog(`Matches written to ${matchesFileName}...`)
  return matches
}