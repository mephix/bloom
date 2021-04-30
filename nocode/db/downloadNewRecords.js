const fs = require('fs')
const fserr = err => {if (err) return console.log(err)}
const adaloApi = require('../apis/adaloApi.js')
const consoleColorLog = require('../utils/consoleColorLog.js')

module.exports = downloadNewRecords

async function downloadNewRecords(collectionName, newFile, existingFile) {
  let existingRecords = []
  if (existingFile) {
    try {
      existingRecords = JSON.parse(fs.readFileSync(existingFile, 'utf8'))
    } catch (e) {
      console.warn(`Unable to load any records from ${existingFile}`)
    }
  }
  let offset = existingRecords.length
  console.log(`${offset} existing records found.`)
  let recordsUpdated = false
  let records
  try {
    let newRecords = await adaloApi.augment(collectionName, offset)
    consoleColorLog(`Downloading new Records SUCCEEDED.`, 'green', emphasis='bold')
    recordsUpdated = true
    // Combine with existing records.
    records = [...existingRecords, ...newRecords]
    if (newFile) {
      console.log(`Writing ${newRecords.length} new records \
and ${existingRecords.length} existing records to ${newFile}`)
      fs.writeFile(newFile, JSON.stringify(records), fserr)
    }
  } catch (e) {
    console.warn(e)
    consoleColorLog(`Downloading new Records FAILED.`, 'red', emphasis='none')
  }
  return { records, recordsUpdated }
}