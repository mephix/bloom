/*
 * Key parameters to set.
 */
let collectionName = 'Users' // 'Dates' // 
let cleanSlate = true
let existingFileDate = '2021-06-09'
const today = '2021-06-09'
// watch out, this might change to tomorrows date in the evening
// const today = (new Date()).toISOString().substring(0,(new Date()).toISOString().indexOf('T'))

// Other parameters.
let newFile = `./nocode/output/${collectionName} ${today}.json`
let existingFile = cleanSlate ? `` : `./nocode/output/${collectionName} ${existingFileDate}.json`
const downloadNewRecords = require('./downloadNewRecords.js')
const consoleColorLog = require('../utils/consoleColorLog.js')

// Run script.
runDownload()

async function runDownload() {
  let { records } = 
    await downloadNewRecords(collectionName, newFile, existingFile)
  if (records.length > 0) {
    if (collectionName === 'Users') {
      console.log(`Finished getting new Users. Now checking them.`)
      checkUsers(records)
    }
  }
}

function checkUsers(records) {
  // Individual field checks
  var idField = 'Email'
  var nullChecks = [
    { name: 'Age', value: null },
    { name: 'City Selection', value: null },
    { name: 'Gender Selection', value: null },
    { name: 'Finished', value: true },
    { name: 'Free', value: false },
  ]
  // Flag M4M and F4F people.
  records.forEach(r => {
    if (r['Gender Preference'] && r['Gender Preference'] === r['Gender']) {
      console.log(`${r['First Name']} (${r['Email']}) is ${r['Gender']} seeking ${r['Gender Preference']}`)
    }
  })
  nullChecks.forEach(({ name, value }) => {
    let uf = records.filter(u => u?.[name]===value)
    if (uf.length===0) consoleColorLog(`${name}...OK`, 'green')
    else {
      // `color`: white, red, yellow, green, cyan, blue, magenta.
      consoleColorLog(`${name}...`, 'magenta')
      uf.map(u => consoleColorLog(`${u[idField]} has ${name}=${value}`, 'magenta'))
    }
  })  
}
