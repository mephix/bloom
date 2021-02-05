const math = require('mathjs')
const graphToMatrix = require('../scores/graphToMatrix.js')

module.exports = dateEngine

function dateEngine (people, matches) {
  const N = people.length
  let dates = []
  if (N < 2) return dates
  // People are sorted (using `sortByPriority`) in the order in which to
  // find them dates.
  // `graphToMatrix` also makes the match scores symmetric, ie it uses
  // m(i,j)*m(j,i) when deciding whether to match i and j. The point being
  // that we are trying to maximize the probability of a mutual heart.
  let M = graphToMatrix({ graph: matches, order: people.map(p => p.id) })
  const all = math.range(0,N).valueOf()
  for (let i=0; i<N; i++) {
    let Mi = math.squeeze(math.subset(M, math.index(i, all)))
    let maxval = math.max(Mi)
    let j = Mi.valueOf().findIndex(x => x==maxval)
    if (maxval > 0) {
      // Create a date
      dates.push({
        id1: people[i].id,
        id2: people[j].id,
        name1: people[i]['First Name'],
        name2: people[j]['First Name'],
        email1: people[i]['Email'],
        email2: people[j]['Email'],
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