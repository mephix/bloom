const dailyApi = require('../dailyApi.js')

module.exports = addDailyRoom

async function addDailyRoom(date, params) {
  const { DAY, SLOT, TIMEZONE_OFFSET, SLOT_LENGTH, SLOT_PREENTRY, SLOT_STARTS, SLOT_ENDS } = params

  // Calculate startDateTime and endDateTime from slot and day.
  date.startTime = DAY + 'T' + SLOT_STARTS[SLOT] + TIMEZONE_OFFSET
  date.endTime = DAY + 'T' + SLOT_ENDS[SLOT] + TIMEZONE_OFFSET
  date.day = DAY

  // Augment date object with newly created fields.
  const startDateTimestamp = Math.floor(new Date(date.startTime).getTime()/1000)
  // `nbf`: allow entry sometime before start
  const nbf = startDateTimestamp - SLOT_PREENTRY*60
  // `exp`: kick everyone out sometime after start
  const exp = startDateTimestamp + SLOT_LENGTH*60

  const dailyResponse = await dailyApi.makeDailyRoom({ nbf, exp })
  date.dailyRoomURL = dailyResponse.data.url
  date.dailyRoomName = dailyResponse.data.name
  return date
}
