const adaloApi = require('../adaloApi.js')

module.exports = postDateToAdalo

async function postDateToAdalo (date, params) {
  const { DAY } = params

  // Create Adalo date object.
  if (!date.name) date.name = `${date.name1} <-> ${date.name2}` || 'NO NAME'
  const adaloDate = {
    'Time Start': startDateTime,
    'Time End': endDateTime,
    'Date': DAY,
    'Name':	date.name,
    'Active': true,
    'daily link': date.dailyRoomURL,
    'daily room name': date.dailyRoomName,
    'email1': date.email1,
    'email2': date.email2,
    'emails': date.email1 + ',' + date.email2,
  }
  return adaloApi.create('Dates', adaloDate)
}
