const fs = require('fs')
const fserr = err => {if (err) return console.log(err)}
const adaloApi = require('../apis/adaloApi.js')
const addProfiles = require('../users/addProfiles.js')

module.exports = getAllUsers

async function getAllUsers({ refresh, backupFile, newBackupFile, maxUsers }) {
  let users
  let usersUpdated = false
  if (refresh) {
    try {
      users = await adaloApi.list('Users', maxUsers)
      console.log(`Downloading Users SUCCEEDED.`)
      profiles = await adaloApi.list('Profiles', maxUsers)
      console.log(`Downloading Profiles SUCCEEDED.`)
      // Make `profile` a field of `user`.
      users = addProfiles({ users, profiles })
      console.log(`Adding Profiles to Users SUCCEEDED.`)
      usersUpdated = true
      if (newBackupFile)
        fs.writeFile(newBackupFile, JSON.stringify(users), fserr)
    } catch (e) {
      console.warn(e)
      console.log(`Downloading Users and/or Profiles FAILED... loading from local storage.`)
    }
  }
  if (!usersUpdated) {
    users = JSON.parse(fs.readFileSync(backupFile, 'utf8'))
  }
  return { users, usersUpdated }
}