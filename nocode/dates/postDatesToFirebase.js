const addRoom = require('../rooms/addRoom.js')
const postDateToFirebase = require('./postDateToFirebase.js')
const consoleColorLog = require('../utils/consoleColorLog.js')
const getWriteTime = require('../utils/getWriteTime.js')

module.exports = postDatesToFirebase

async function postDatesToFirebase(dates, params) {
  // Add videochat Rooms to Dates.
  console.log(`Adding Daily rooms to Dates...`)
  await Promise.all(dates.map(date => addRoom(date, params)))

  // Post the dates.
  const rs = await Promise.all(dates.map(date => postDateToFirebase(date)))
  consoleColorLog(`${rs.length} dates posted to Firebase at ${getWriteTime(rs)}`, 'green', 'bold')
}
