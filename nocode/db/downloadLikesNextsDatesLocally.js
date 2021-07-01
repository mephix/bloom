const fs = require('fs')
const fserr = err => {if (err) return console.log(err)}
const firestoreApi = require('../apis/firestoreApi.js')
const consoleColorLog = require('../utils/consoleColorLog.js')

/*
 * PARAMETERS TO SET
 */
today = '2021-07-01'
const dev = '-dev' // '' //
const filepath = `./nocode/output`


downloadLikesNextsDatesLocally(today)

function downloadLikesNextsDatesLocally(today) {

  // Download collections.
  let [likes, nexts, dates] = await Promise.all([
    getFireCollection('Likes' + dev, `${filepath}/firebase Likes${dev} ${today}.json`),
    getFireCollection('Nexts' + dev, `${filepath}/firebase Nexts${dev} ${today}.json`),
    getFireCollection('Dates' + dev, `${filepath}/firebase Dates${dev} ${today}.json`),
  ])
}

async function getFireCollection(collection, filename) {
    const query = await firestoreApi.db.collection(collection).get()
    let docs = query.docs.map(doc => { return { id: doc.id, createTime: doc.createTime, ...doc.data() }})
    docs.sort((u,v) => u.createTime.seconds - v.createTime.seconds)
    fs.writeFile(filename, JSON.stringify(docs), fserr)
    colorConsoleLog(`${collection}: ${docs.length} downloaded.`, 'green')
}

// function printFireUser(u) {
//     console.log(`[${u.createTime.toDate().toString()}]: ${u.firstName} (${u.gender}, ${u.age})`)
// }
