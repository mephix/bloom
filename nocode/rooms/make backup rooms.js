/*
 * Key parameters to set
 */
let DAY = '2021-06-28'
let HOUR = 19
let nRooms = 3
let slots = [0,1,2,3,4,5,6]

// Less frequently changed parameters. 
// Change timezone between 7 and 8 depending on Daylight Saving.
const TIMEZONE_OFFSET = '-07:00'
const SLOT_PREENTRY = 1
const SLOT_STARTS = {
  0:  HOUR + ':00',
  1:  HOUR + ':05',
  2:  HOUR + ':10',
  3:  HOUR + ':15',
  4:  HOUR + ':20',
  5:  HOUR + ':25',
  6:  HOUR + ':30',
  7:  HOUR + ':35',
  8:  HOUR + ':40',
  9:  HOUR + ':45',
  10: HOUR + ':50',
  11: HOUR + ':55',
}
const SLOT_ENDS = {
  0:  HOUR + ':05',
  1:  HOUR + ':10',
  2:  HOUR + ':15',
  3:  HOUR + ':20',
  4:  HOUR + ':25',
  5:  HOUR + ':30',
  6:  HOUR + ':35',
  7:  HOUR + ':40',
  8:  HOUR + ':45',
  9:  HOUR + ':50',
  10: HOUR + ':55',
  11: HOUR + ':59',
}
const daily = require('../apis/dailyApi.js')
const adalo = require('../apis/adaloApi.js')
const consoleColorLog = require('../utils/consoleColorLog.js')
module.exports = makeBackupRooms

makeBackupRooms()

async function makeBackupRooms() {

  let endTime, startTime, nbf, exp
  let room
  for (let s=0; s<slots.length; s++) {
    endTime   = DAY + 'T' + SLOT_ENDS[slots[s]] + TIMEZONE_OFFSET
    startTime = DAY + 'T' + SLOT_STARTS[slots[s]] + TIMEZONE_OFFSET
    nbf = daily.calcNbf({ startTime, preentry: SLOT_PREENTRY })
    exp = daily.calcExp({ endTime })

    // `r` is just a counter and doesn't get used. 
    for (let r=0; r<nRooms; r++) {
      const dailyResponse = await daily.makeRoom({ nbf, exp })
      room = {
        Name: dailyResponse.data.name,
        Link: dailyResponse.data.url,
        Start: startTime,
        End: endTime,
      }
      const adaloResponse = await adalo.create('Rooms', room)
      console.log(`Slot ${slots[s]}: Room ${r} (${dailyResponse.data.name}) posted to Adalo: ${adaloResponse.statusText}`)      
    }
  }
  consoleColorLog(`Created ${nRooms} rooms each in slots ${slots}`, 'green')
}