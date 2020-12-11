const axios = require('axios').default
const adaloApi = require('../adaloApi.js')

runTest()

async function runTest() {
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
