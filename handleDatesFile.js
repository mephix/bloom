const fs = require('fs')

exports.writeDatesFile = writeDatesFile
exports.readDatesFile = readDatesFile

function readDatesFile(fileName) {
  let rows = []
  try { rows = fs.readFileSync(fileName, 'utf8').split('\n') } catch (e) { console.warn(e) }
  let dates = []
  // Don't parse row 0 because it is a header row.
  for (let i=1; i<rows.length; i++) {
    let [ name1, name2, matchscore, email1, email2, slot, startTime, endTime, room, status, ...rest ] = rows[i].split(',')
    dates[i-1] = { name1, name2, matchscore, email1, email2, slot, startTime, endTime, room, status }
  }
  return dates
}

function writeDatesFile(dates, fileName) {
  const datesFileContent = `name1,name2,score,email1,email2,slot,time_start,time_end,daily_room\n`
    + dates.map(d => 
      `${d.name1},${d.name2},${d.matchscore},${d.email1},${d.email2},${d.slot},${d.startTime},${d.endTime},${d.room}`
      ).join('\n')
  fs.writeFile(fileName, datesFileContent, function (err) {if (err) return console.log(err)})
  console.log(`Dates written to file ${fileName}`)  
}
