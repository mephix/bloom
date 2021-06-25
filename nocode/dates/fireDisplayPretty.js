

module.exports = fireDisplayPretty

function fireDisplayPretty(dates, users) {
  console.log(`\n${dates.length} dates created.`)
  console.log(``)
  dates.forEach(d => {
    try {
      let p1 = users.find(u => u.id === d.id1)
      let p2 = users.find(u => u.id === d.id2)
      let p1str = `${p1.gender}, ${p1.age}, ${p1.city}, ${p1.zipcode}, ${p1.email}`
      let p2str = `${p2.gender}, ${p2.age}, ${p2.city}, ${p2.zipcode}, ${p2.email}`
      console.log(`${d.name1} (${p1str})`)
      console.log(`${d.name2} (${p2str})`)
      console.log(`matchscore ${d.matchscore.toPrecision(2)}`)
      console.log(``)
    } catch (e) { console.warn(e) }
  })
}