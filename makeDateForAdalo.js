// const axios = require('axios').default
const { makeDailyRoom } = require('./dailyApi.js')

module.exports = makeDateForAdalo

async function makeDateForAdalo (day, hour, date, dailyRoomURL) {
  // timezone
  const TIMEZONE_OFFSET = '-08:00'
  // Daily params for slots
  const LENGTH = 8
  const PREENTRY = 2
  // Map of slots to times.
  const slots = {
    0: hour + ':02',
    1: hour + ':10',
    2: hour + ':18',
    3: hour + ':26',
    4: hour + ':34',
    5: hour + ':42',
  }
  const slotEnds = {
    0: hour + ':10',
    1: hour + ':18',
    2: hour + ':26',
    3: hour + ':34',
    4: hour + ':42',
    5: hour + ':50',
  }
  // Calculate startDateTime and endDateTime from slot and day.
  const startDateTime = day + 'T' + slots[date.slot] + TIMEZONE_OFFSET
  const startDateTimestamp = Math.floor(new Date(startDateTime).getTime()/1000)
  const endDateTime = day + 'T' + slotEnds[date.slot] + TIMEZONE_OFFSET

  // Get Daily room URL.
  if (!dailyRoomURL) {
    const dailyResponse = await makeDailyRoom (startDateTimestamp, LENGTH, PREENTRY)
    dailyRoomURL = dailyResponse.data.url
    dailyRoomName = dailyResponse.data.name
  }

  // Augment date object with newly created fields.
  date.startTime = startDateTime
  date.endTime = endDateTime
  date.room = dailyRoomURL
  date.roomName = dailyRoomName

  // Create Adalo date object.
  if (!date.name) date.name = `${date.name1} <-> ${date.name2}` || 'NO NAME'
  const adaloDate = {
    'Time Start': startDateTime,
    'Time End': endDateTime,
    'Date': day,
    'Name':	date.name,
    'Active': true,
    'daily link': dailyRoomURL,
    'daily room name': dailyRoomName,
    'email1': date.email1,
    'email2': date.email2,
    'emails': date.email1 + ',' + date.email2,
  }
  return adaloDate
}
