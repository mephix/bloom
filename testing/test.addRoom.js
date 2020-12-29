
// Params.
let ROUND_ID = 1
let DAY = '2020-12-29'
let HOUR = 15
let SLOT = 0
let RERUN = false

// Less frequently changed params:
// timezone, slot length, preentry, starts and ends.
const TIMEZONE_OFFSET = '-08:00'
const SLOT_LENGTH = 8
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
const params = { DAY, SLOT, TIMEZONE_OFFSET, SLOT_LENGTH, SLOT_PREENTRY, SLOT_STARTS, SLOT_ENDS }

async function testAddRoom(date, params) {
  let room = await addRoom(date, params)
  console.log(`${room}`)
}
