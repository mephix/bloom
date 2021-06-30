const consoleColorLog = require('../utils/consoleColorLog.js')

module.exports = fireDisplayPretty

function fireDisplayPretty(dates, users) {
  consoleColorLog(`\n${dates.length} dates created.`, 'green', 'bold')
  console.log(``)
  dates.forEach(d => {
    try {
      let p1 = users.find(u => u.id === d.for)
      let p2 = users.find(u => u.id === d.with)
      let p1str = `${p1.gender}, ${p1.age.toPrecision(2)}, ${p1.zipcode}, ${p1.city}, ${p1.email}`
      let p2str = `${p2.gender}, ${p2.age.toPrecision(2)}, ${p2.zipcode}, ${p2.city}, ${p2.email}`
      console.log(`${d.forName} (${p1str})`)
      console.log(`${d.withName} (${p2str})`)
      console.log(`matchscore ${d.matchscore.toPrecision(2)}`)
      console.log(``)
    } catch (e) { console.warn(e) }
  })
}