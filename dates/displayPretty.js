

module.exports = displayPretty

function displayPretty(dates, users) {
  dates.forEach(d => {
    try {
      let p1 = users.find(u => u.Email === d.email1)
      let p2 = users.find(u => u.Email === d.email2)
      let p1str = `${p1.Gender}, ${p1.Age}, ${p1.City}, ${p1.Zipcode}, ${p1.Email}`
      let p2str = `${p2.Gender}, ${p2.Age}, ${p2.City}, ${p2.Zipcode}, ${p2.Email}`
      console.log(`${d.name1} (${p1str})`)
      console.log(`${d.name2} (${p2str})`)
      console.log(`matchscore ${d.matchscore.toPrecision(2)}`)
      console.log(``)
    } catch (e) { console.warn(e) }
  })
}