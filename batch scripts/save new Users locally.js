const getNewUsers = require('../users/getNewUsers.js')
const getAllUsers = require('../users/getAllUsers.js')
const csv = require('../csv.js')
const fs = require('fs')
/* 
 * Test and run here
 */

let existingUsersFile = './csvs/Users 2021-01-12 old1.json'
let newFile =           './csvs/Users 2021-01-12.json'
// let csvOutputFile = './csvs/Users 2021-01-12.csv'
runGetNewUsers()

async function runGetNewUsers() {
  console.log(`Starting runGetNewUsers...`)
  let { users } = await getNewUsers({ existingUsersFile, newFile })
  // Don't also write in csv format because fields like Prospects are comma
  // separated.
  // csv.writeToCsv(users, csvOutputFile)
  let noGender = users.filter(u => u.profile['Gender']===null)
  let noGenderPref = users.filter(u => u.profile['Gender Preference']===null)
}
  
// let maxUsers = 350
// let backupFile =    './csvs/Users 2021-01-11.json'
// let newBackupFile = './csvs/Users 2021-01-11.json'
// runGetAllUsers()
// alsoWriteAsCsv()

async function runGetAllUsers() {
  console.log(`Starting runGetAllUsers...`)
  // `getAllUsers` saves users in `newBackupFile`.
  let { users } = await getAllUsers({
    refresh: true,
    backupFile,
    newBackupFile,
    maxUsers,
  })
  // Also write in csv format.
  csv.writeToCsv(users, csvOutputFile)
}

function alsoWriteAsCsv() {
  let users = JSON.parse(fs.readFileSync(newBackupFile, 'utf8'))
  csv.writeToCsv(users, csvOutputFile)
}