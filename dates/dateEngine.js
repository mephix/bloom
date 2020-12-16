const math = require('mathjs')

module.exports = dateEngine

function dateEngine (people, matches) {
  const N = people.length
  let dates = []
  if (N < 2) return dates
  // People are sorted in the order in which to find them dates.
  let M = graphToMatrix({ graph: matches, order: people.map(p => p.id) })
  for (let i=0; i<N; i++) {
    let Mi = math.squeeze(math.subset(M, math.index(i, all)))
    let maxval = math.max(Mi)
    let j = Mi.findIndex(x => x==maxval)
    if (maxval > 0) {
      // Create a date
      dates.push({
        id1: people[i].id,
        id2: people[j].id,
        name1: people[i].name,
        name2: people[j].name,
        email1: people[i].email,
        email2: people[j].email,
        matchscore: maxval,
      })
      // Zero out person i with anyone else for this slot
      M = math.subset(M, math.index(i, all), math.zeros(1,N))
      M = math.subset(M, math.index(all, i), math.zeros(N,1))
      // Zero out person j with anyone else for this slot
      M = math.subset(M, math.index(j, all), math.zeros(1,N))
      M = math.subset(M, math.index(all, j), math.zeros(N,1))
    }
  }
  return dates
}