

module.exports = displayPretty

function displayPretty(dates, users) {
  dates.forEach(d => {
    try {
      let p1 = users.find(u => u.Email === d.email1)
      let p2 = users.find(u => u.Email === d.email2)
      let p1str = `${p1.Gender}, ${p1.Age}, ${p1.City}, ${p1.Zipcode}`
      let p2str = `${p2.Gender}, ${p2.Age}, ${p2.City}, ${p2.Zipcode}`
      console.log(`matchscore ${d.matchscore.toPrecision(2)}: ${d.email1} ${d.email2}`)
      console.log(`${d.name1} (${p1str}) with ${d.name2} (${p2str})`)
    } catch (e) { console.warn(e) }
  })
}