const daily = require('../apis/dailyApi.js')

module.exports = addRoom

async function addRoom(date, params) {
  const { DAY, SLOT, TIMEZONE_OFFSET, SLOT_LENGTH, SLOT_PREENTRY, SLOT_STARTS, SLOT_ENDS } = params

  // Calculate startDateTime and endDateTime from slot and day.
  date.startTime = DAY + 'T' + SLOT_STARTS[SLOT] + TIMEZONE_OFFSET
  date.endTime = DAY + 'T' + SLOT_ENDS[SLOT] + TIMEZONE_OFFSET
  date.day = DAY
  date.slot = SLOT

  // Augment date object with newly created fields.
  const startDateTimestamp = Math.floor(new Date(date.startTime).getTime()/1000)
  // `nbf`: allow entry sometime before start
  const nbf = startDateTimestamp - SLOT_PREENTRY*60
  // `exp`: kick everyone out sometime after start
  const exp = startDateTimestamp + SLOT_LENGTH*60

  const dailyResponse = await daily.makeRoom({ nbf, exp })
  date.dailyRoomURL = dailyResponse.data.url
  date.dailyRoomName = dailyResponse.data.name

  // Get each participant's token
  const [token1, token2] = await Promise.all([
    daily.getToken({
      user_name: date.name1,
      user_id: date.email1,
    }),
    daily.getToken({
      user_name: date.name2,
      user_id: date.email2,
    }),
  ])
  date.token1 = token1
  date.token2 = token2

  return date
}
