const getNewUsers = require('../users/getNewUsers.js')
const getAllUsers = require('../users/getAllUsers.js')
const csv = require('../csv.js')
const fs = require('fs')
/* 
 * Test and run here
 */

let existingUsersFile = './csvs/Users 2021-01-27.json' // './csvs/Users 2021 clean slate.json' // 
let newFile =           './csvs/Users 2021-01-27.json'
runGetNewUsers()

async function runGetNewUsers() {
  console.log(`Starting runGetNewUsers...`)
  let { users } = await getNewUsers({ existingUsersFile, newFile })
  if (users) {
    console.log(`Finished getting new users. Now checking them...`)
    // Checks
    // !! add a check for profile being missing !!
    let checks = [
      { name: 'Gender', value: null },
      { name: 'Gender Preference', value: null },
      { name: 'Finished', value: true },
      { name: 'Free', value: false },
    ]
    checks.forEach( ({ name, value }) => {
      console.log(`Checking ${name}...`)
      let uf = users.filter(u => u?.profile?.[name]===value)
      if (uf.length===0) console.log(`OK`)
      uf.map(u => console.log(`${u.Email} has ${name}=${value}`))
    })
  } else {
    console.log(`No new users returned.`)
  }
}

// let csvOutputFile = './csvs/Users 2021-01-12.csv'
// Don't also write in csv format because fields like Prospects are comma
// separated.
// csv.writeToCsv(users, csvOutputFile)

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