const { readCsv } = require('../utils/csv.js')

module.exports = updateUsersForTodaysDates

function updateUsersForTodaysDates(users, fileName, notFreeSlot=-1) {
  const dates = readCsv(fileName)
  for ({ id1, id2, slot } of dates) {
    let u1 = users.filter(u => u['id'] === Number(id1))[0]
    let u2 = users.filter(u => u['id'] === Number(id2))[0]
    // Reset each person's wait time.
    let now = (new Date()).toISOString()
    if (u1) u1['Wait Start Time'] = now 
    if (u2) u2['Wait Start Time'] = now   
    // Set these people to not free in the selected slot.
    if (Number(slot)===notFreeSlot) {
      if (u1) u1['Free'] = false 
      if (u2) u2['Free'] = false   
    }
    if (u1 && u2) {
      // Add each to the other's list of 'dated'.
      // This will add each twice now that we have 2 records for 1 date.
      u1.Dated ? u1.Dated.push(u2.id) : u1.Dated = [u2.id]
      u2.Dated ? u2.Dated.push(u1.id) : u2.Dated = [u1.id]
    }
  }
  return [ users, dates ]
}

// const { readCsv } = require('../utils/csv.js')

// module.exports = updateUsersForTodaysDates

// function updateUsersForTodaysDates(users, fileName, notFreeSlot=-1) {
//   const dates = readCsv(fileName)
//   for ({ devId1, devId2, slot } of dates) {
//     let u1 = users.filter(u => u['devId'] === devId1)[0]
//     let u2 = users.filter(u => u['devId'] === devId2)[0]
//     // Reset each person's wait time.
//     let now = (new Date()).toISOString()
//     if (u1) u1['Wait Start Time'] = now 
//     if (u2) u2['Wait Start Time'] = now   
//     // Set these people to not free in the selected slot.
//     if (Number(slot)===notFreeSlot) {
//       if (u1) u1['Free'] = false 
//       if (u2) u2['Free'] = false   
//     }
//     if (u1 && u2) {
//       // Add each to the other's list of 'dated'.
//       // This will add each twice now that we have 2 records for 1 date.
//       u1.Dated ? u1.Dated.push(u2.devId) : u1.Dated = [u2.devId]
//       u2.Dated ? u2.Dated.push(u1.devId) : u2.Dated = [u1.devId]
//     }
//   }
//   return [ users, dates ]
// }