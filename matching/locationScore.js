const math = require('mathjs')
const { zipcodeDistance, loadZipLatlons } = require('./zipcodeDistance.js')

// Load zipcodes.
const zipLatLons = loadZipLatlons()

module.exports = locationScore

function locationScore(p,q) {
  // Location match.
  // Score is <- [0,1].
  const d = zipcodeDistance(p.zip, q.zip, zipLatLons)
  const sigs = (d !== -1) ? d/p.radius : 1
  // Choose beta such that at distance=radius (in miles) the score is 0.5.
  const BETA = 0.69314718056
  const z_location = math.exp(-BETA*sigs)
  return z_location
}