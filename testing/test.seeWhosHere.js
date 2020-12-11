const seeWhosHere = require('./seeWhosHere.js')

testSeeWhosHere()

async function testSeeWhosHere () {
  const { peopleHere, allUsers } = await seeWhosHere()
  console.log(`There are ${peopleHere.length} people here.`)
}
