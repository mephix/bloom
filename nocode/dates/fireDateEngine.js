const munkres = require('munkres-js')

module.exports = fireDateEngine

function fireDateEngine (people, matches) {
  let dates = []
  if (people.length < 2) return dates
  let ids = Object.keys(matches)
  let rows = Object.keys(ids)

  // Construct symmetric match matrix M and then cost matrix P.
  let M = [], P = []
  for (let i=0; i<rows.length; i++) {
    M[i] = []
    P[i] = []
    for (let j=0; j<rows.length; j++) {
      // Get match scores.
      let mij = matches[ids[i]]?.[ids[j]] || 0
      let mji = matches[ids[j]]?.[ids[i]] || 0
      M[i][j] = mij * mji
      // Match benefit is the (symmetric) match score weighted by priorities.
      // Minus sign converts benefits to costs.
      P[i][j] = - M[i][j] * people[ids[i]].priority * people[ids[j]].priority
    }
  }

  // Find optimal pairs.
  // munkres provides an O(n³) implementation of the Munkres algorithm 
  // (also called the Hungarian algorithm or the Kuhn-Munkres algorithm). 
  // The algorithm models an assignment problem as an N×M cost matrix, 
  // where each element represents the cost of assigning the ith worker to the jth job, 
  // and it figures out the least-cost solution, choosing a single item from each row 
  // and column in the matrix, such that no row and no column are used more than once.
  // https://github.com/addaleax/munkres-js
  let pairs = munkres(P)

  // Each pair will be found twice, as [i,j] and [j,i], because the matrix is symmetric. 
  // Also some people may be matched with themselves ([i,i]) if they dont have a better date.
  // So keep only once each pair of distinct people with match score > 0.
  pairs.filter(p => (p[0] < p[1] && P[i][j] !== 0))

  // Create dates from pairs
  pairs.forEach((i,j) => {
    // The date is 'with' the gentleman and 'for' the lady.
    let [f, w] = people[ids[i]].gender === 'f' ? [i,j] : [j,i]
    dates.push({
      for: ids[f],
      with: ids[w],
      forName: people[ids[f]].firstName,
      withName: people[ids[w]].firstName,
      // Keep the component parts of the match-benefit matrix for reference.
      score: {
        match: M[f][w],
        benefit: -P[f][w],
        priorityFor: people[ids[f]].priority,
        priorityWith: people[ids[w]].priority,
      }
    })    
  })

  return dates
}