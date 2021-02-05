/*
 * Key parameters to set
 */
let DAY = '2021-02-03'
let HOUR = 17
let nRooms = 5
let slots = [0,1,2,3,4,5,6]

// Less frequently changed parameters. 
// TIMEZONE_OFFSET, SLOT_PREENTRY, SLOT_STARTS, SLOT_ENDS
const TIMEZONE_OFFSET = '-08:00'
const SLOT_PREENTRY = 2
const SLOT_STARTS = {
  0: HOUR + ':02',
  1: HOUR + ':10',
  2: HOUR + ':18',
  3: HOUR + ':26',
  4: HOUR + ':34',
  5: HOUR + ':42',
  6: HOUR + ':50',
}
const SLOT_ENDS = {
  0: HOUR + ':10',
  1: HOUR + ':18',
  2: HOUR + ':26',
  3: HOUR + ':34',
  4: HOUR + ':42',
  5: HOUR + ':50',
  6: HOUR + ':58',
}

const daily = require('../apis/dailyApi.js')
const adalo = require('../apis/adaloApi.js')
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
  console.log(`Created ${nRooms} rooms each in slots ${slots}`)
}