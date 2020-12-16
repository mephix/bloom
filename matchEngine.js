const ageScore = require('./ageScore.js')
const genderScore = require('./genderScore.js')
const locationScore = require('./locationScore.js')

module.exports = matchEngine

// matchEngine()

function matchEngine (people) {

  // Initialize match graph.
  let matchGraph = []
  people.forEach( p => {
    matchGraph[p.email] = []
  })

  // Compute match graph.
  people.forEach( p => {
    people.forEach ( q => {

      // Gender score.
      let z_gender = genderScore(p,q)

      // Age score
      let z_age = ageScore(p,q)

      // Location score.
      let z_location = locationScore(p,q)

      // Total score.
      let z = z_gender * z_age * z_location

      // Don't match a pansexual person with themself (unless thats what they're into).
      if (p.email === q.email) z = 0

      // Match is <-[0-5].
      matchGraph[p.email][q.email] = z * 5
    })
  })

  return matchGraph
}