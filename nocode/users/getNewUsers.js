const fs = require('fs')
const fserr = err => {if (err) return console.log(err)}
const adaloApi = require('../apis/adaloApi.js')
const addProfiles = require('./addProfiles.js')

module.exports = getNewUsers

async function getNewUsers(existingUsersFile, newFile) {
  let existingUsers = JSON.parse(fs.readFileSync(existingUsersFile, 'utf8'))
  let offset = existingUsers.length
  console.log(`${offset} existing users found.`)
  let usersUpdated = false
  let users
  try {
    let newUsers = await adaloApi.augment('Users', offset)
    console.log(`Downloading new Users SUCCEEDED.`)
    let newProfiles = await adaloApi.augment('Profiles', offset)
    console.log(`Downloading new Profiles SUCCEEDED.`)
    // Make `profile` a field of `user`.
    let newUsersWithProfiles = addProfiles({ users: newUsers, profiles: newProfiles })
    console.log(`Adding Profiles to Users SUCCEEDED.`)
    usersUpdated = true
    // Combine with existing users.
    users = [...existingUsers, ...newUsersWithProfiles]
    if (newFile) {
      console.log(`Writing ${newUsersWithProfiles.length} new users and ${existingUsers.length} existing users to ${newFile}`)
      fs.writeFile(newFile, JSON.stringify(users), fserr)
    }
  } catch (e) {
    console.warn(e)
    console.log(`Downloading new Users and/or Profiles FAILED.`)
  }
  return { users, usersUpdated }
}