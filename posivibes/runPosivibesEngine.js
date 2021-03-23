/*
 * main params to set
 */
const existingDate = '2021-02-22'
const today = '2021-02-22' // (new Date()).toISOString().substring(0,(new Date()).toISOString().indexOf('T'))
const postToAdalo = false

// Dependencies.
const fs = require('fs')
// const getNewUsers = require('../users/getNewUsers.js')
const downloadNewRecords = require('../db/downloadNewRecords.js')
const addOldDates = require('./addOldDates.js')
const addHearted = require('./addHearted.js')
const computeScore = require('../scores/computeScore.js')
const matchEngine = require('../matches/matchEngine.js')
const toMLMatrix = require('../scores/toMLMatrix.js')
const computeRank = require('../scores/computeRank.js')
const lodash = require('lodash')
const zipObject = lodash.zipObject
const sortBy = lodash.sortBy
const { writeToCsv } = require('../utils/csv.js')
const adaloApi = require('../apis/adaloApi.js')

runPosivibesEngine()

async function runPosivibesEngine() {
  console.log(`Running Posivibes Engine...`)

  // Load users.
  let existingUsersFile = `./csvs/Users ${existingDate}.json`
  // let newUsersFile =      `./csvs/Users ${today}.json`
  // if (refresh)
  //   var { users } = await getNewUsers(existingUsersFile, newUsersFile)
  // else
    var users = JSON.parse(fs.readFileSync(existingUsersFile, 'utf8'))

  // Load or download dates.
  let existingDatesFile = `./csvs/Dates ${existingDate}.json`
  // let newDatesFile =      `./csvs/Dates ${today}.json`
  // if (refreshDates)
  //   var { records: dates } = await downloadNewRecords('Dates', newDatesFile, existingDatesFile)
  // else
    var dates = JSON.parse(fs.readFileSync(existingDatesFile, 'utf8'))

  // Add dates from old database (and output for checking).
  let allDates = [...dates, ...addOldDates(users)]
  // let reducedDates = allDates.map({ })
  writeToCsv(allDates, `./csvs/Dates for checking.csv`)

  // Add `hearted` field to Users.
  users = addHearted(users, allDates)

  // Get ids and users keyed by id.
  const usersById = []
  users.map(({ id, ...rest }) => usersById[id] = { id, ...rest })
  const ids = Object.keys(usersById)
  
  // Compute different scores.
  //
  // `notself` is a trivial meaure, but actually useful for the stability
  // of the rank calculation. `notself` functions like a Bayesian prior.
  //
  // We have to compute them one-by-one because if computed together,
  // computeScore will calculate them multiplicatively and with a
  // short-circuit.
  const { score: heartedScore } = computeScore(usersById, { 'hearted': { transform: z => z, weight: 1, score: [] } })
  const { score: matchScore } = matchEngine(users)
  const { score: likedScore }   = computeScore(usersById, { 'liked':   { transform: z => z, weight: 1, score: [] } })
  const { score: notselfScore } = computeScore(usersById, { 'notself': { transform: z => z, weight: 1, score: [] } })

  // Convert graphs to matrices.
  const hearted = toMLMatrix(heartedScore, ids)
  const match   = toMLMatrix(matchScore, ids)
  const liked   = toMLMatrix(likedScore, ids)
  const notself = toMLMatrix(notselfScore, ids)

  /*
  The true score we want is P[heart] where this is 1 or 0 for people who
  have dated, and their match score when they haven't. So weights (1,1) on
  heart and match, and not on anything else. So the problem with our
  current posivibes is not that it is computed in the wrong framework, but
  that our match scores are not very good. They don't take into account
  previous outcomes (hearts and non-hearts), only gender age and location.
  A better match score would come from a logistic regression which included
  previous hearts and non-hearts.
  */
  
  // Note that the weights don't need to sum to 1 because `computeRank`
  // markovizes.
  const weights = {
    hearted: 1.00,
    match:   0.05,
    liked:   0.00,
    notself: 0.01,
  }
  const score = hearted.mul(weights.hearted)
    .add(match.mul(weights.match))
    .add(liked.mul(weights.liked))
    .add(notself.mul(weights.notself))

  // Compute posivibes as the rank implied by the scores. 
  // Since the scores as calculated measure value (eg hearts or likes)
  // given, we transpose the matrix to measure value received.
  const posivibes = computeRank(score.transpose())

  // Sum each person's hearts, match scores and likes received.
  let { sumById: heartsumById } = sumThing(heartedScore, usersById, 0)
  let { sumById: matchsumById } = sumThing(matchScore, usersById, 2)
  let { sumById: likesumById }  = sumThing(likedScore, usersById, 2)

  // Compile all the output data we want.
  let posivibesZipped = ids.map((id, i) => ({ 
    'email': usersById[id]['Email'],
    'name': usersById[id]['First Name'],
    'posivibes': posivibes[i],
    'hearts': heartsumById[id].toFixed(0),
    'matches': matchsumById[id].toFixed(1),
    'likes': likesumById[id].toFixed(0),
    'gender': usersById[id]['Gender'],
    'age': usersById[id]['Age'],
    'zip': usersById[id]['Zipcode'],
    'posivibes override': usersById[id]['Posivibes'],
    'id': id,
  }))

  // Sort by posivibes.
  let posivibesSorted = sortBy(posivibesZipped, x => -x.posivibes)

  // Write people and their posivibes to csv.
  writeToCsv(posivibesSorted, `./csvs/Posivibes ${today}.csv`, '\t')

  // Post to Adalo.
  // In reverse order, and one by one to avoid 503 errors.
  // Key by id.
  let posivibesById = zipObject(ids, posivibes)
  if (postToAdalo) {
    let reverseIds = Object.keys(posivibesById).reverse()
    let responses = []
    for (let i=0; i<0; i++) { // default is reverseIds.length
      let id = reverseIds[i]
      let response = await adaloApi.update('Users', id, { Posivibes: posivibesById[id] })
      console.log(`[${i}]: ${usersById[id].Email}: posivibes of ${posivibesById[id]} posted ${response.statusText}`)
      responses.push(response)
    }
    let responseSummary = [...new Set(responses.map(r=>r.statusText))]
    console.log(`Distinct responses: ${responseSummary}`)  
  }

  return { posivibesById, posivibesSorted }
}

function sumThing(thing, usersById, decimalPlaces = 6) {
  let sum = []
  let sumById = {}
  const ids = Object.keys(usersById).map(Number)
  ids.forEach(i => {
    sumById[i] = 0
    ids.forEach((j) => {
      // (j,i) because it is sum of thing RECEIVED.
      sumById[i] += thing?.[j]?.[i] || 0
    })
    sum.push({ 
      'id': i,
      'sum': sumById[i].toFixed(decimalPlaces),
      'email': usersById[i]['Email'],
      'name': usersById[i]['First Name'],
      'posivibes override': usersById[i]['Posivibes'],
    })
  })
  sum = sortBy(sum, x => -x.sum)
  return { sum, sumById }
}
