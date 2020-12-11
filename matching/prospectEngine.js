const ageScore = require('./ageScore.js')
const genderScore = require('./genderScore.js')
const locationScore = require('./locationScore.js')

module.exports = prospectEngine

// prospectEngine()

function prospectEngine (people) {
  let prospectGraph = []
  for (const [pid, p] of Object.entries(people)) {
    prospectGraph[pid] = []
    for (const [qid, q] of Object.entries(people)) {

      // Gender score.
      let z_gender = genderScore(p,q)

      // Age score
      let z_age = ageScore(p,q)

      // Location score.
      // The further away, the better!
      // Less chance of them being in the round.
      let z_location = 1 - locationScore(p,q)

      // Total score.
      let z = z_gender * z_age * z_location

      // Don't show a person to themselves.
      if (p.email === q.email) z = 0

      // Scale score <- [0-1]
      prospectGraph[pid][qid] = z * 1
    }
  }

  return prospectGraph
}