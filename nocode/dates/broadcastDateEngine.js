const munkres = require('munkres-js')

module.exports = broadcastDateEngine

function broadcastDateEngine (people, matches, score_min) {
  let dates = []
  if (people.length < 2) return dates
  let ids = Object.keys(matches)
  let rows = Object.keys(ids)

  for (let i=0; i<rows.length; i++) {
    for (let j=i+1; j<rows.length; j++) {
      // Get match score in each direction.
      let mij = matches[ids[i]]?.[ids[j]] || 0
      let mji = matches[ids[j]]?.[ids[i]] || 0
      // Construct the symmetric match score.
      // Divide by 100 once because both match scores are scaled 0-100.
      let score = mij * mji / 100

      if (score >= score_min) {
        // The date is 'with' the gentleman and 'for' the lady.
        let [f, w] = people[ids[i]].gender === 'f' ? [i,j] : [j,i]
        dates.push({
          for: ids[f],
          with: ids[w],
          forName: people[ids[f]].firstName,
          withName: people[ids[w]].firstName,
          score,
        })
      }
    }
  }
  return dates
}