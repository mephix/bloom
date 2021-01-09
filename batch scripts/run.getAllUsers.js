const getAllUsers = require('../users/getAllUsers.js')

/* 
 * Test and run here
 */
let maxUsers = 350
let backupFile = './csvs/Users 20210107.json'
let newBackupFile = './csvs/Users 20210107.json'
runGetAllUsers()

async function runGetAllUsers() {
  console.log(`Starting runGetAllUsers...`)
  // `getAllUsers` saves users in `newBackupFile`.
  let { users } = await getAllUsers({
    refresh: true,
    backupFile,
    newBackupFile,
    maxUsers,
  })
}