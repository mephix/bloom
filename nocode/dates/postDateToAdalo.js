const adaloApi = require('../apis/adaloApi.js')

module.exports = postDateToAdalo

function postDateToAdalo (date) {

  // Create a pair of Adalo date objects.
  const commonFields = {
    'Active': true,
    'Time Start': date.startTime,
    'Time End': date.endTime,
    'Room Link': date.dailyRoomURL,
    'Room Name': date.dailyRoomName,
    'Had Fun': true,
    'Heart': false,
  }
  const for1 = {
    'Name':	`${date.name1} with ${date.name2}`,
    'For': date.id1,
    'For Email': date.email1,
    'With': date.id2,
    'With Email': date.email2,
    'Room Token': date.token1,
  }
  const for2 = {
    'Name':	`${date.name2} with ${date.name1}`,
    'For': date.id2,
    'For Email': date.email2,
    'With': date.id1,
    'With Email': date.email1,
    'Room Token': date.token2,
  }
  return [
    adaloApi.create('Dates', { ...commonFields, ...for1, }),
    adaloApi.create('Dates', { ...commonFields, ...for2, }),
  ]
}
