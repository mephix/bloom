import math from 'mathjs'
import { zipObject, sortBy } from 'lodash'
const fs = require('fs')
const fserr = err => {if (err) return console.log(err)}
const matchEngine = require('../matches/matchEngine.js')
const posivibesEngine = require('./posivibesEngine.js')
const { writeToCsv } = require('../utils/csv.js')

const refresh = true
const today = (new Date()).toISOString().substring(0,(new Date()).toISOString().indexOf('T'))
// const existingFile = './csvs/Dates 2021-01-29.json'
// const newFile =      './csvs/Dates 2021-01-29.json'
// const posivibesFile = './csvs/Posivibes'

runPosivibesEngine()

async function runPosivibesEngine() {
  console.log(`Starting Posivibes Engine...`)

  // Load or download users.
  if (refresh)
    let { users } = await getNewUsers({ 
      existingFile: `./csvs/Users ${today}.json`,
      newFile:      `./csvs/Users ${today}.json`,
    })
  else
    let users = JSON.parse(fs.readFileSync(existingFile, 'utf8'))

  // Load or download dates.
  if (refresh)
    let { dates } = await getDatesFromAdalo({ 
      existingFile: `./csvs/Dates ${today}.json`,
      newFile:      `./csvs/Dates ${today}.json`,
    })
  else
    let dates = JSON.parse(fs.readFileSync(existingFile, 'utf8'))
  
  // Calculate `hearts`.
  dates.forEach(d => {
    hearts[d.For]
      // If this field is initialized, set the subfield.
      ? hearts[d.For][d.With] = d.Heart
      // If this field isn't initialized yet, set the field.
      : hearts[d.For] = { [d.With]: d.Heart }
  })

  // Calculate `matches`.
  let { compositeScore, subScores } = matchEngine(users)
  const CUTOFF = 0.01   // Keep only scores above a cutoff, for matrix sparseness.
  let matches = subsetScores(compositeScore, { above: CUTOFF })

  // Calculate P, the heart probability matrix.
  const ids = Object.keys(users)
  const n = ids.length
  let P = math.zeros(n, n, 'sparse')
  ids.forEach(i => {
    ids.forEach(j => {
      let p = 
        (hearts[i]?.[j] === true) ? 1 :   // Dated and hearted.
        (hearts[i]?.[j] === false) ? 0 :  // Dated but didn't heart.
        (matches[i]?.[j] || 0)            // Didn't date yet. Use match score.
      P.subset(math.index(i, j), p)
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

  return { posivibesById, posivibesSorted }
}