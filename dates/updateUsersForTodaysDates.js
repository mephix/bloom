const fs = require('fs')

module.exports = updateUsersForTodaysDates

function updateUsersForTodaysDates(users, fileName) {
  let rows = []
  try { rows = fs.readFileSync(fileName, 'utf8').split('\n') } catch (e) { console.warn(e) }
  let dates = []
  // Don't parse row 0 because it is a header row.
  for (let i=1; i<rows.length; i++) {
    let [ name1, name2, matchscore, email1, email2, slot, startTime, endTime, room, status, ...rest ] = rows[i].split(',')
    dates[i-1] = { name1, name2, matchscore, email1, email2, slot, startTime, endTime, room, status }
    let u1 = users.filter(u => u.email === email1)[0]
    let u2 = users.filter(u => u.email === email2)[0]
    // Add each to the other's list of 'dated'
    u1.dated ? u1.dated.push(u2.id) : u1.dated = [u2.id]
    u2.dated ? u2.dated.push(u1.id) : u2.dated = [u1.id]
    // Reset each person's wait time.
    let now = (new Date()).toISOString()
    u1.checkInTime = now 
    u2.checkInTime = now   
  }
  return [ users, dates ]
}