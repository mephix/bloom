const fs = require('fs')

exports.readDatesFile = readDatesFile
exports.writeDatesFile = writeDatesFile

function readDatesFile(fileName) {
  let rows = []
  try { rows = fs.readFileSync(fileName, 'utf8').split('\n') } catch (e) { console.warn(e) }
  let dates = []
  // Don't parse row 0 because it is a header row.
  for (let i=1; i<rows.length; i++) {
    if (rows[i]==='') continue
    let [ name1, name2, matchscore, email1, email2, slot, startTime, endTime, roomName ] = rows[i].split(',')
    dates[i-1] = { name1, name2, matchscore, email1, email2, slot, startTime, endTime, roomName }
    // let [ name1, name2, matchscore, email1, email2, slot, startTime, endTime, room, status, ...rest ] = rows[i].split(',')
    // dates[i-1] = { name1, name2, matchscore, email1, email2, slot, startTime, endTime, room, status }
  }
  return dates
}

function writeDatesFile(dates, fileName) {
  const datesFileContent = `name1,name2,score,email1,email2,slot,time_start,time_end,room_name\n`
    + dates.map(d => 
      `${d.name1},${d.name2},${d.matchscore},${d.email1},${d.email2},${d.slot},${d.startTime},${d.endTime},${d.dailyRoomName}`
      ).join('\n')
  fs.writeFile(fileName, datesFileContent, function (err) {if (err) return console.log(err)})
  console.log(`Dates written to file ${fileName}`)  
}