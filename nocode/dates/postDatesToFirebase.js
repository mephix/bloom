const postDateToFirebase = require('./postDateToFirebase.js')
const consoleColorLog = require('../utils/consoleColorLog.js')

module.exports = postDatesToFirebase

async function postDatesToFirebase(dates, params) {
  // Add videochat Rooms to Dates.
  console.log(`Adding Daily rooms to Dates...`)
  await Promise.all(dates.map(date => addRoom(date, params)))

  // Post the dates.
  const rs = await Promise.all(dates.map(date => postDateToFirebase(date)))
  // const wts = rs[rs.length-1].map(r => r.writeTime.toDate())
  // const wt = `${wts[0].getHours().toString().padStart(2, '0')}:${wts[0].getMinutes().toString().padStart(2, '0')}`
  // consoleColorLog(`${rs.length} dates posted to Firebase at ${wt}`, 'green', 'bold')
  consoleColorLog(`${rs.length} dates posted to Firebase at ${getWriteTime(rs)}`, 'green', 'bold')
}

function getWriteTime(rs) {
  // Get last result.
  let rsl = rs[rs.length-1]
  // Get a write time, doesn't matter which one.
  let wtl = rsl[0].writeTime.toDate()
  // Get hours, minutes, seconds
  let hh = wtl.getHours().toString().padStart(2, '0')
  let mm = wtl.getMinutes().toString().padStart(2, '0')
  let ss = wtl.getSeconds().toString().padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}