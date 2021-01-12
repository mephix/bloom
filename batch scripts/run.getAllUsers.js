const getAllUsers = require('../users/getAllUsers.js')
const csv = require('../csv.js')
const fs = require('fs')
/* 
 * Test and run here
 */
let maxUsers = 350
let backupFile =    './csvs/Users 2021-01-11.json'
let newBackupFile = './csvs/Users 2021-01-11.json'
let csvOutputFile = './csvs/Users 2021-01-11.csv'
runGetAllUsers()
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