const fs = require('fs')
const fserr = err => {if (err) return console.log(err)}
const firestoreApi = require('../apis/firestoreApi.js')
const consoleColorLog = require('../utils/consoleColorLog.js')

/*
 * PARAMETERS TO SET
 */
today = '2021-07-13'
const dev = '-dev' // '' //
const filepath = `./nocode/output`


downloadCollectionsLocally(today)

async function downloadCollectionsLocally(today) {

  // Download collections.
  let [users, old_users, likes, nexts, dates, phones] = await Promise.all([
    getFireCollection('Users' + dev,  `${filepath}/firebase Users${dev} ${today}.json`),
    getFireCollection('RestoreUsers', `${filepath}/firebase RestoreUsers ${today}.json`),
    getFireCollection('Likes' + dev,  `${filepath}/firebase Likes${dev} ${today}.json`),
    getFireCollection('Nexts' + dev,  `${filepath}/firebase Nexts${dev} ${today}.json`),
    getFireCollection('Dates' + dev,  `${filepath}/firebase Dates${dev} ${today}.json`),
    getFireCollection('PhoneNumbers', `${filepath}/firebase Phones ${today}.json`),
  ])
}

async function getFireCollection(collection, filename) {
    const query = await firestoreApi.db.collection(collection).get()
    let docs = query.docs.map(doc => { return { id: doc.id, createTime: doc.createTime, ...doc.data() }})
    docs = docs.filter(d => d.id !== "null")
    docs.sort((u,v) => v.createTime.seconds - u.createTime.seconds)
    fs.writeFile(filename, JSON.stringify(docs), fserr)
    consoleColorLog(`${collection}: ${docs.length} downloaded.`, 'green')
}

// function printFireUser(u) {
//     console.log(`[${u.createTime.toDate().toString()}]: ${u.firstName} (${u.gender}, ${u.age})`)
// }
