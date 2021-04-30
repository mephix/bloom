const daily = require('../apis/dailyApi.js')
const firestore = require('../apis/firestoreApi.js')
const addRoom = require('../rooms/addRoom.js')
const postDateToFirebase = require('../dates/postDateToFirebase.js')
const consoleColorLog = require('../utils/consoleColorLog.js')

testPostDateToFirebase()

async function testPostDateToFirebase() {
  // Choose the time for the test date.
  let DAY = '2021-03-10'
  let HOUR = '10'
  let SLOT = 8
  const TIMEZONE_OFFSET = '-08:00'
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
  const params = { DAY, SLOT, TIMEZONE_OFFSET, SLOT_PREENTRY, SLOT_STARTS, SLOT_ENDS }

  /*
   * Create a `date` object including the fields:
   * name1, name2, id1, id2 (of participants)
   */
  let date = {
    // name1: 'John', id1: 'john.prins@gmail.com',
    name1: 'Justin', id1: 'justinstanislaw@gmail.com',
    name2: 'Amel', id2: 'amel.assioua@gmail.com',
  }
  /*
   * Add the fields:
   * startTime, endTime
   * dailyRoomName, dailyRoomURL, nbf, exp
   * token1, token2 (for participants)
   */
  date = await addRoom(date, params)

  // Post the two Dates and their Room.
  let rs = await postDateToFirebase(date)

  // Log the result.
  const wts = rs.map(r => r.writeTime.toDate())
  const wt = `${wts[0].getHours()}:${wts[0].getMinutes()}`
  consoleColorLog(`Dates & Room posted to Firebase at ${wt}`, 'green', 'bold')
}

async function createRoom() {
  let DAY = '2021-02-17'
  let HOUR = 14
  let slot = 0
  const TIMEZONE_OFFSET = '-08:00'
  const SLOT_PREENTRY = 1
  const SLOT_STARTS = {
    0: HOUR + ':00',
    1: HOUR + ':05',
    2: HOUR + ':10',
    3: HOUR + ':16',
    4: HOUR + ':22',
    5: HOUR + ':28',
    6: HOUR + ':34',
    7: HOUR + ':40',
    8: HOUR + ':46',
    9: HOUR + ':50',
  }
  const SLOT_ENDS = {
    0: HOUR + ':05',
    1: HOUR + ':10',
    2: HOUR + ':16',
    3: HOUR + ':22',
    4: HOUR + ':28',
    5: HOUR + ':34',
    6: HOUR + ':40',
    7: HOUR + ':46',
    8: HOUR + ':50',
    9: HOUR + ':58',
  }
  const endTime = DAY + 'T' + SLOT_ENDS[slot] + TIMEZONE_OFFSET
  const startTime = DAY + 'T' + SLOT_STARTS[slot] + TIMEZONE_OFFSET
  const nbf = daily.calcNbf({ startTime, preentry: SLOT_PREENTRY })
  const exp = daily.calcExp({ endTime })
  const { data: { name, url } } = await daily.makeRoom({ nbf, exp })
  // Use the room name as the Firestore id.
  const room = { name, url, nbf, exp, dates: [] }
  const firestoreResponse = await firestore.update('Rooms', name, room)
  const writeTime = firestoreResponse.writeTime.toDate().toISOString()
  console.log(`Room ${name} (${startTime} - ${endTime}) posted to Firestore at ${writeTime}`)      

}

async function testGetDb() {
  let db = getDb()
  return db
}
