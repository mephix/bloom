
const fs = require('fs')
// const fserr = err => {if (err) return console.log(err)}

const date = '2021-02-03'
const oldDatesFile = `./csvs/pre-Reborn Dates ${date}.json`
const oldUsersFile = `./csvs/pre-Reborn Users ${date}.json`

module.exports = addOldDates

// Old dates have a 'Matched' field which includes the ids of any
// participants who hearted. So we need old Users as well, to get their
// emails in order to match them to user ids in the new Users collection.
// We need to produce dates with fields 'For' and 'With' (new ids) and
// 'Heart' (boolean).
function addOldDates(users) {
  let oldDates = JSON.parse(fs.readFileSync(oldDatesFile, 'utf8'))
  let oldUsers = JSON.parse(fs.readFileSync(oldUsersFile, 'utf8'))
  let dates = []
  let countOfDatesAdded = 0
  oldDates.forEach(d => {
    // get the two 'Participants'.
    if (d.Participants?.length !== 2) return
    let idOld0 = d.Participants[0]
    let idOld1 = d.Participants[1]
    let uOld0 = oldUsers.findIndex(u => u.id === idOld0)
    let uOld1 = oldUsers.findIndex(u => u.id === idOld1)
    if (uOld0 === -1 || uOld1 === -1) return
    // get Emails and new Ids
    let email0 = oldUsers[uOld0].Email
    let email1 = oldUsers[uOld1].Email
    let u0 = users.findIndex(u => u.Email === email0)
    let u1 = users.findIndex(u => u.Email === email1)
    if (u0 === -1 || u1 === -1) return
    let id0 = users[u0].id
    let id1 = users[u1].id
    // get 'Matched'.
    dates.push({ For: [id0], With: [id1], Heart: d.Matched?.includes(idOld0), 'For Email': email0, 'With Email': email1 })
    dates.push({ For: [id1], With: [id0], Heart: d.Matched?.includes(idOld1), 'For Email': email1, 'With Email': email0 })
    countOfDatesAdded++
  })
  console.log(`${oldDates.length} old dates found and ${countOfDatesAdded} dates added.`)
  return dates
}