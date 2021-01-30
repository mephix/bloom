/*
 * main params to set
 */
const refresh = false
const today = (new Date()).toISOString().substring(0,(new Date()).toISOString().indexOf('T'))
const date = '2021-01-29' // today

// Dependencies.
const getNewUsers = require('../users/getNewUsers.js')
const fs = require('fs')
const getDatesFromAdalo = require('../dates/getDatesFromAdalo.js')
const matchEngine = require('../matches/matchEngine.js')
const subsetScores = require('../scores/subsetScores.js')
const math = require('mathjs')
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

  // Calculate P, the heart probability matrix.
  const ids = Object.keys(peopleById).map(Number)
  const n = ids.length
  let P = math.zeros(n, n, 'sparse')
  ids.forEach((i,pi) => {
    ids.forEach((j,pj) => {
      let p = 
        (hearts[i]?.[j] === true) ? 1 :   // Dated and hearted.
        (hearts[i]?.[j] === false) ? 0 :  // Dated but didn't heart.
        (matches[i]?.[j] || 0)            // Didn't date yet: use match score.
      P.subset(math.index(pi, pj), p)
    })
  })

  // Calculate posivibes (on a 0-10 scale).
  const posivibes = posivibesEngine(P)

  // Key by id.
  let posivibesById = zipObject(ids, posivibes)

  // Sort and output.
  let posivibesZipped = ids.map((id, i) => ({ 'id': id, 'posivibes': posivibes[i] }))
  let posivibesSorted = sortBy(posivibesZipped, x => -x.posivibes)
  writeToCsv(posivibesSorted, `./csvs/Posivibes ${today}.json`)

  // Post to Adalo.
  // In reverse order, and one by one to avoid 503 errors.
  let reverseIds = Object.keys(posivibesById).reverse()
  let responses = []
  for (let i=0; i<reverseIds.length; i++) {
    let id = reverseIds[i]
    let response = await adaloApi.update('Users', id, { Posivibes: posivibesById[id] })
    console.log(`[${i}]: ${peopleById[id].Email}: posivibes of ${posivibesById[id]} posted ${response.statusText}`)
    responses.push(response)
  }
  let responseSummary = [...new Set(responses.map(r=>r.statusText))]
  console.log(`Distinct responses: ${responseSummary}`)  

  return { posivibesById, posivibesSorted }
}