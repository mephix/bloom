/*
 * PARAMETERS TO SET
 */
today = '2021-07-13'
const dev = '-dev' // '' //
const filepath = `./nocode/output`

const getFireCollection = require('../db/getFireCollection.js')

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
