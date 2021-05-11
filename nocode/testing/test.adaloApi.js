const adaloApi = require('../apis/adaloApi.js')
const fs = require('fs')

let usersLocalFile = `./nocode/output/Users 2021-01-11.json`
testAugment()

async function testAugment() {
  let existingUsers = JSON.parse(fs.readFileSync(usersLocalFile, 'utf8'))
  let newUsers = await adaloApi.augment('Users', existingUsers.length)
  console.log(`${newUsers.length} new users obtained.`)
  return
}

async function testList(N=250) {
  let records = await adaloApi.list('Users', N)
  console.log(`${records.length} records found.`)
  return records
}

async function testSortingOfIds() {
  let activeRound = await getActiveRound()
  let userIdsToSetHere = [300, 200, 40]
  await addUsersHereToRound(activeRound, userIdsToSetHere)
  activeRound = await getActiveRound()
}

async function addUsersHereToRound(activeRound, userIds) {
  let response = await adaloApi.update('Rounds', activeRound.id, { 'Here': userIds })
  console.log(`Adding new users...${response.statusText}`)
  return
}

async function getActiveRound() {
  console.log(`Getting active Round(s)...`)
  let rounds = await adaloApi.get('Rounds')
  let activeRounds = rounds.filter(r => r.Active)
  console.log(`found ${activeRounds.length} active Round(s).`)
  console.log(`Users Here: ${activeRounds[0].Here}`)
  return activeRounds[0]
}
