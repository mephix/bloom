const daily = require('../apis/dailyApi.js')
const consoleColorLog = require('../utils/consoleColorLog.js')

module.exports = addRoom

async function addRoom(date, params) {
  const { DAY, SLOT, TIMEZONE_OFFSET, SLOT_PREENTRY, SLOT_STARTS, SLOT_ENDS } = params

  // Calculate startDateTime and endDateTime from slot and day.
  date.startTime = DAY + 'T' + SLOT_STARTS[SLOT] + TIMEZONE_OFFSET
  date.endTime = DAY + 'T' + SLOT_ENDS[SLOT] + TIMEZONE_OFFSET
  date.day = DAY
  date.slot = SLOT
  const nbf = daily.calcNbf({ startTime: date.startTime, preentry: SLOT_PREENTRY })
  const exp = daily.calcExp({ endTime: date.endTime })
  // Avoid Daily error when room expiry time is in the past.
  const expDate = new Date(exp*1000)
  if (expDate < (new Date())) {
    // consoleColorLog: white, red, yellow, green, cyan, blue, magenta
    consoleColorLog(`The expiry time for this Room:`, 'magenta')
    consoleColorLog(`${expDate}`, 'blue')
    consoleColorLog(`is in the past. This will cause a Daily 400 error. Exiting.`, 'magenta')
    process.exit()
  }
  let dailyResponse = await daily.makeRoom({ nbf, exp })
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

  // Addition for firebase dates
  date.nbf = nbf
  date.exp = exp

  return date
}
