const fs = require('fs')
const adaloApi = require('../apis/adaloApi.js')

module.exports = getSomeUsers

async function getSomeUsers(ids, backupFile, throwError, method='parallel') {
  // Use `throwError` to simulate a 503 error from Adalo.
  let usersHere
  let usersUpdated = false
  try {
    // debugging only
    if (throwError) throw new Error(`Simulating a 503 error...`)

    if (method==='sequential') {
      let usersHere = []
      for (let i=0; i<ids.length; i++) {
        let user = await adaloApi.get('Users', ids[i])
        let profile = await adaloApi.get('Profiles', user.Profile)
        // Make `profile` a field of `user`.
        usersHere.push({ ...user, profile })
      }
    } else {
      usersHere = await Promise.all(ids.map(async id => {
        let user = await adaloApi.get('Users', id)
        let profile = await adaloApi.get('Profiles', user.Profile)
        // Make `profile` a field of `user`.
        return { ...user, profile }
      }))
    }
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