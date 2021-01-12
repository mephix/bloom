// const { readDatesFile } = require('../dates/readAndWriteDatesFile.js')
const { readCsv } = require('../csv.js')

module.exports = updateUsersForTodaysDates

function updateUsersForTodaysDates(users, fileName) {
  const dates = readCsv(fileName)
  for ({ email1, email2 } of dates) {
    let u1 = users.filter(u => u['Email'] === email1)[0]
    let u2 = users.filter(u => u['Email'] === email2)[0]
    // Reset each person's wait time.
    let now = (new Date()).toISOString()
    if (u1) u1['Wait Start Time'] = now 
    if (u2) u2['Wait Start Time'] = now   
    if (u1 && u2) {
      // Add each to the other's list of 'dated'.
      // This will add each twice now that we have 2 records for 1 date.
      u1.Dated ? u1.Dated.push(u2.id) : u1.Dated = [u2.id]
      u2.Dated ? u2.Dated.push(u1.id) : u2.Dated = [u1.id]
    }
  }
  return [ users, dates ]
}