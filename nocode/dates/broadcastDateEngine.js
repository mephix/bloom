const munkres = require('munkres-js')

module.exports = broadcastDateEngine

function broadcastDateEngine (people, matches, users, score_min) {
  let dates = []
  if (people.length < 2) return dates

  // `people` is a map, and `matches` is an object double-keyed by ids.
  for (let pid of people.keys()) {
    for (let mid of Object.keys(matches)) {
      // Get match score in both directions.
      let mij = matches[pid]?.[mid] || 0
      let mji = matches[mid]?.[pid] || 0
      // Construct the symmetric match score.
      // Divide by 100 once because both match scores are scaled 0-100.
      let score = mij * mji / 100

      // Check that the score is positive (to avoid corner cases like someone
      // getting a date with themselves) in addition to being greater than the
      // minimum score.
      if (score > 0 && score >= score_min) {
        dates.push({
          for: mid,
          with: pid,
          forName: users.get(mid).firstName,
          withName: users.get(pid).firstName,
          score,
        })
      }
    }
  }
  return dates
}