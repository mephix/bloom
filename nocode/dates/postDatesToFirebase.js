const postDateToFirebaseDev = require('./postDateToFirebaseDev.js')
const consoleColorLog = require('../utils/consoleColorLog.js')

module.exports = postDatesToFirebase

function postDatesToFirebase() {
  const rs = await Promise.all(dates.map(date => postDateToFirebaseDev(date)))
  const wts = rs[rs.length-1].map(r => r.writeTime.toDate())
  const wt = `${wts[0].getHours()}:${wts[0].getMinutes()}`
  consoleColorLog(`${rs.length} dates posted to Firebase at ${wt}`, 'green', 'bold')
}