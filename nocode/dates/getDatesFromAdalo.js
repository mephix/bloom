const fs = require('fs')
const fserr = err => {if (err) return console.log(err)}
const adaloApi = require('../apis/adaloApi.js')

module.exports = getDatesFromAdalo

async function getDatesFromAdalo(existingFile, newFile) {
  let existingDates
  try {
    existingDates = JSON.parse(fs.readFileSync(existingFile, 'utf8'))
  } catch (e) {
    existingDates = []
    console.warn(`Unable to load any dates from ${existingFile}`)
  }
  let offset = existingDates.length
  console.log(`${offset} existing dates found.`)
  let datesUpdated = false
  let dates
  try {
    let newDates = await adaloApi.augment('Dates', offset)
    console.log(`Downloading new Dates SUCCEEDED.`)
    datesUpdated = true
    // Combine with existing dates.
    dates = [...existingDates, ...newDates]
    if (newFile) {
      console.log(`Writing ${newDates.length} new dates \
and ${existingDates.length} existing dates to ${newFile}`)
      fs.writeFile(newFile, JSON.stringify(dates), fserr)
    }
  } catch (e) {
    console.warn(e)
    console.log(`Downloading new Dates FAILED.`)
  }
  return { dates, datesUpdated }
}