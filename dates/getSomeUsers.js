const fs = require('fs')
const adaloApi = require('../adaloApi.js')

module.exports = getSomeUsers

async function getSomeUsers(ids, backupFile) {
  let usersHere
  let usersUpdated = false
  try {
    usersHere = await Promise.all(ids.map(id => adaloApi.get('Users', id)))
    console.log(`Downloading Users here SUCCEEDED.`)
    usersUpdated = true
    // fs.writeFile(`./csvs/Users (${DAY}).json`, JSON.stringify(usersHere), errf)

  } catch (e) {
    console.warn(e)
    console.log(`Downloading Users here FAILED... loading from local storage.`)
    usersUpdated = false
    let users = JSON.parse(fs.readFileSync(backupFile, 'utf8'))
    usersHere = users.filter(u => ids.includes(u.id))
  }
  return { usersHere, usersUpdated }
}