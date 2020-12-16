const fs = require('fs')
const adaloApi = require('../adaloApi.js')

module.exports = getUsers

async function getUsers({ refresh, fileName }) {
  if (refresh) {
    console.log(`Loading Users collection from Adalo`)
    users = await adaloApi.get('Users')
    fs.writeFile(fileName, JSON.stringify(users), err => {if (err) return console.log(err)})
  } else {
    console.log(`Loading Users collection from local storage`)
    users = JSON.parse(fs.readFileSync(fileName, 'utf8'))
  }
  return users
}