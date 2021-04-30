const adaloApi = require('../apis/adaloApi.js')
const fs = require('fs')
const fserr = err => {if (err) return console.log(err)}

/*
 * Params to set.
 */
const today = (new Date()).toISOString().substring(0,(new Date()).toISOString().indexOf('T'))
const date = today // '2021-02-03' // 

// Prior to running this, make sure to go into adaloApi and set OLD=true
// and then change it back afterwards.
saveOldCollection('Users old')
saveOldCollection('Dates old')

async function saveOldCollection(collectionName) {
  let oldCollection = await adaloApi.augment(collectionName, 0)
  let fileName = `./output/pre-Reborn ${collectionName} ${date}.json`
  fs.writeFile(fileName, JSON.stringify(oldCollection), fserr)  
  console.log(`SUCCESS: ${fileName} written.`)
}
