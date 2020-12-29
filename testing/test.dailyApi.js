const daily = require('../dailyApi.js')

// let ROOM_NAME = 'jessica-reza' // 'KcOIGHdXunuCc62kAX0u'
// testGetDailyRoom(ROOM_NAME)

// // startDateTime gets converted from PST to UTC, nice.
// const startDateTime = '2020-12-19T19:00'
// const startDateTimestamp = Math.floor(new Date(startDateTime).getTime()/1000)
// const response = testMakeDailyRoom(startDateTimestamp)

var properties = {user_name: 'Raphael'}
const response = testGetToken(properties)

async function testGetToken(properties) {
  let token = await daily.getToken(properties)
  console.log(`The token returned is ${token}`)
  return token
}

async function testGetDailyRoom(roomName) {
  let response = await daily.getRoom(roomName)
  console.log(`The name of the new room is ${response.data.name}`)
  return response
}

async function testMakeDailyRoom(startDateTimestamp) {
  let response = await daily.makeRoom(startDateTimestamp)
  console.log(`The name of the new room is ${response.data.name}`)
  return response
}
