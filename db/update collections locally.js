/*
 * Key parameters to set.
 */
let collectionName = 'Users' // 'Dates' // 
let cleanSlate = true
let existingFileDate = '2021-02-03'

// Checks
var checks = []
var idField
if (collectionName === 'Users') {
  idField = 'Email'
  checks = [
    { name: 'Gender', value: null },
    { name: 'Gender Preference', value: null },
    { name: 'Finished', value: true },
    { name: 'Free', value: false },
  ]
}

// Other parameters.
const today = (new Date()).toISOString().substring(0,(new Date()).toISOString().indexOf('T'))
let newFile = `./csvs/${collectionName} ${today}.json`
let existingFile = cleanSlate ? `` : `./csvs/${collectionName} ${existingFileDate}.json`
const downloadNewRecords = require('./downloadNewRecords.js')

// Run script.
runDownload()

async function runDownload() {
  let { records } = 
    await downloadNewRecords(collectionName, newFile, existingFile)
  if (records.length > 0) {
    console.log(`Finished getting new records. Now checking them.`)
    checks.forEach( ({ name, value }) => {
      console.log(`Checking ${name}...`)
      let uf = records.filter(u => u?.[name]===value)
      if (uf.length===0) console.log(`OK`)
      else uf.map(u => console.log(`${u[idField]} has ${name}=${value}`))
    })  
  }
}
