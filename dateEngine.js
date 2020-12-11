const math = require('mathjs')

module.exports = dateEngine

function dateEngine (peopleHere, Ms, slots) {
  const N = peopleHere.length
  let dates = []
  let peopleWithNoDateInAnyRound = new Set(peopleHere.map(x => x.email))
  if (N<2) return { dates, peopleWithNoDateInAnyRound }
  // Initialize sortOrder to the order in which peopleHere is.
  // This should be descending order of posivibes.
  // !! peopleHere *must* be in the same sort order as Ms !!
  const all = math.range(0,N).valueOf()
  let sortOrder = all

  for (let s=0; s<slots.length; s++) {
    let gotADate = []
    // Get this slot's match matrix
    let M = Ms[s]
    // Find people dates in order of their sorting (initially, posivibes)
    for (let g=0; g<sortOrder.length; g++) {
      let i = sortOrder[g]
      let Mi = math.squeeze(math.subset(M, math.index(i, all)))
      let maxval = math.max(Mi)
      let j = Mi.findIndex(x => x==maxval)
      if (maxval > 0) {
        // Create a date
        dates.push({
          name1: peopleHere[i].name,
          name2: peopleHere[j].name,
          email1: peopleHere[i].email,
          email2: peopleHere[j].email,
          slot: slots[s],
          matchscore: maxval,
        })
        // Track the people who don't get a date in any round.
        peopleWithNoDateInAnyRound.delete(peopleHere[i].email)
        peopleWithNoDateInAnyRound.delete(peopleHere[j].email)
        // Track the people who got a date this round.
        gotADate.push(i)
        gotADate.push(j)
        // Zero out person i with anyone else for this slot
        M = math.subset(M, math.index(i, all), math.zeros(1,N))
        M = math.subset(M, math.index(all, i), math.zeros(N,1))
        // Zero out person j with anyone else for this slot
        M = math.subset(M, math.index(j, all), math.zeros(1,N))
        M = math.subset(M, math.index(all, j), math.zeros(N,1))
        // Zero out (i,j) and (j,i) for all future slots
        for (let t=s+1; t < slots.length; t++) {
          Ms[t] = math.subset(Ms[t], math.index(i,j), 0)
          Ms[t] = math.subset(Ms[t], math.index(j,i), 0)
        }
      }
    }
    // Now update the sortOrder for the next period.
    // People who didn't get a date this round go to the front
    let didntGetADate = sortOrder.filter(x => !gotADate.includes(x))
    sortOrder = math.concat(didntGetADate, gotADate)
  }
  return { dates, peopleWithNoDateInAnyRound }
}