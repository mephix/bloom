const adaloApi = require('../adaloApi.js')

module.exports = postDateToAdalo

function postDateToAdalo (date, params) {

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
    'Name':	`${date.name1} <- ${date.name2}`,
    'For': date.id1,
    'For Email': date.email1,
    'With': date.id2,
    'With Email': date.email2,
  }
  const for2 = {
    'Name':	`${date.name2} <- ${date.name1}`,
    'For': date.id2,
    'For Email': date.email2,
    'With': date.id1,
    'With Email': date.email1,
  }
  return [
    adaloApi.create('Dates', { ...commonFields, ...for1, }),
    adaloApi.create('Dates', { ...commonFields, ...for2, }),
  ]
}
