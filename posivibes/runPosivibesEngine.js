/*
 * main params to set
 */
const refresh = false
const postToAdalo = false
const today = (new Date()).toISOString().substring(0,(new Date()).toISOString().indexOf('T'))
const date = '2021-01-29' // today

// Dependencies.
const getNewUsers = require('../users/getNewUsers.js')
const fs = require('fs')
const getDatesFromAdalo = require('../dates/getDatesFromAdalo.js')
const matchEngine = require('../matches/matchEngine.js')
const subsetScores = require('../scores/subsetScores.js')
const math = require('mathjs')
const markovize = require('./markovize.js')
const posivibesEngine = require('./posivibesEngine.js')
const lodash = require('lodash')
const zipObject = lodash.zipObject
const sortBy = lodash.sortBy
const { writeToCsv } = require('../utils/csv.js')
const adaloApi = require('../apis/adaloApi.js')

runPosivibesEngine()

async function runPosivibesEngine() {
  console.log(`Starting Posivibes Engine...`)

  // Load or download users.
  let existingUsersFile = `./csvs/Users ${date}.json`
  let newUsersFile =      `./csvs/Users ${date}.json`
  if (refresh)
    var { users } = await getNewUsers(existingUsersFile, newUsersFile)
  else
    var users = JSON.parse(fs.readFileSync(existingUsersFile, 'utf8'))

  // Load or download dates.
  let existingDatesFile = `./csvs/Dates ${date}.json`
  let newDatesFile =      `./csvs/Dates ${date}.json`
  if (refresh)
    var { dates } = await getDatesFromAdalo(existingDatesFile, newDatesFile)
  else
    var dates = JSON.parse(fs.readFileSync(existingDatesFile, 'utf8'))

  // Calculate `hearts`.
  let hearts = {}
  dates.forEach(d => {
    hearts[d.For]
      // If this field is initialized, set the subfield.
      ? hearts[d.For][d.With] = d.Heart
      // If this field isn't initialized yet, set the field.
      : hearts[d.For] = { [d.With]: d.Heart }
  })

  // Calculate `matches`.
  let { score, subScores, peopleById } = matchEngine(users)
  const CUTOFF = 0.01   // Keep only scores above a cutoff, for matrix sparseness.
  let matches = subsetScores(score, { above: CUTOFF })

  // Sort people by sum of hearts received.
  let { sum: heartsum, sumById: heartsumById } = sumThing(hearts, peopleById, 0)
  
  // Sort people by sum of match scores received.
  let { sum: matchsum, sumById: matchsumById } = sumThing(matches, peopleById, 2)
  
  // Calculate P, the heart probability matrix.
  // If they dated already, use the actual heart <- {0, 1}, otherwise use
  // their match score <- [0,1] as a heart probability score.
  // A higher `MIN` makes the ranking more stable. 
  const MIN = 0.01  // Avoid full zero for stability.
  const mdw = 0.1  // Downweight match scores.
  const ids = Object.keys(peopleById).map(Number)
  const n = ids.length
  let P = math.zeros(n, n, 'sparse')
  ids.forEach((i,pi) => {
    ids.forEach((j,pj) => {
      // Calculate the value given by i to j.
      let p = 
        (hearts[i]?.[j] === true) ? 1 :   // Dated and hearted.
        (hearts[i]?.[j] === false) ? 0 :  // Dated but didn't heart.
        (matches[i]?.[j]*mdw || MIN)      // Didn't date yet: use (downweighted) match score.
      // hearts[i][j] is value given to j (because i hearted j).
      // matches[i][j] is value given to j (because i values j as a match).
      // So in P, flip via (pj, pi) because in P we put the receiver of
      // value on the row.
      P.subset(math.index(pj, pi), p)
    })
  })

  // Check for people with no hearts or matches.
  let zeromatches = 0
  ids.forEach((j,pj) => {
    if (math.sum(math.row(P, pj)).valueOf() === 0) {
      console.warn(`User ${j} (${peopleById[j].Email}) has no hearts or matches`)
      zeromatches++
    }
  })
  if (zeromatches) console.warn(`${zeromatches} people in total have no hearts or matches.`)
  
  // Calculate posivibes (on a 0-10 scale).
  // Currently users' intrinsic value (v) is 0.
  const Pm = markovize(P)
  const posivibes = posivibesEngine(Pm)

  // Key by id.
  let posivibesById = zipObject(ids, posivibes)

  // Sort and output.
  let posivibesZipped = ids.map((id, i) => ({ 
    'id': id,
    'posivibes': posivibes[i],
    'hearts': heartsumById[id].toFixed(0),
    'matches': matchsumById[id].toFixed(2),
    'email': peopleById[id]['Email'],
    'name': peopleById[id]['First Name'],
    'posivibes override': peopleById[id]['Posivibes'],
  }))
  let posivibesSorted = sortBy(posivibesZipped, x => -x.posivibes)
  writeToCsv(posivibesSorted, `./csvs/Posivibes ${today}.csv`, '\t\t')

  // Post to Adalo.
  // In reverse order, and one by one to avoid 503 errors.
  if (postToAdalo) {
    let reverseIds = Object.keys(posivibesById).reverse()
    let responses = []
    for (let i=0; i<0; i++) { // default is reverseIds.length
      let id = reverseIds[i]
      let response = await adaloApi.update('Users', id, { Posivibes: posivibesById[id] })
      console.log(`[${i}]: ${peopleById[id].Email}: posivibes of ${posivibesById[id]} posted ${response.statusText}`)
      responses.push(response)
    }
    let responseSummary = [...new Set(responses.map(r=>r.statusText))]
    console.log(`Distinct responses: ${responseSummary}`)  
  }

  return { posivibesById, posivibesSorted }
}

function sumThing(thing, peopleById, decimalPlaces = 6) {
  let sum = []
  let sumById = {}
  const ids = Object.keys(peopleById).map(Number)
  ids.forEach(i => {
    sumById[i] = 0
    ids.forEach((j) => {
      // (j,i) because it is sum of thing RECEIVED.
      sumById[i] += thing?.[j]?.[i] || 0
    })
    sum.push({ 
      'id': i,
      'sum': sumById[i].toFixed(decimalPlaces),
      'email': peopleById[i]['Email'],
      'name': peopleById[i]['First Name'],
      'posivibes override': peopleById[i]['Posivibes'],
    })
  })
  sum = sortBy(sum, x => -x.sum)
  return { sum, sumById }
}
