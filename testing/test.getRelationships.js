const fs = require('fs')
const adaloApi = require('../adaloApi.js')
const getInviteGraph = require('../getInviteGraph.js.js')
const getDateGraph = require('../getDateGraph.js')
// Path relative to bloom root.
INVITES_FILE = './csvs/Invites.csv'
DATES_FILE = './csvs/Dates.csv'

// testGetRelationships(getDateGraph, DATES_FILE)
testGetRelationships(getInviteGraph, INVITES_FILE)

async function testGetRelationships (getX, fileName) {
  // Get users.
  const users = await adaloApi.get('Users')

  // Key users by id
  const usersById = []
  users.map(({ id, ...rest }) => usersById[id] = rest)
  const ids = Object.keys(usersById)

  const relationships = await getX(usersById)
  const lines = Object.keys(relationships).map(e1 =>
    Object.keys(relationships[e1]).map(e2 => 
      `${e1},${e2},${relationships[e1][e2]}`
    )
  )
  const fileContent = `email1,email2,relationship\n` +
    lines.flat().join('\n')
  fs.writeFile(fileName, fileContent, function (err) {if (err) {return console.log(err)}})
  console.log(`Finished writing to ${fileName}`)
}