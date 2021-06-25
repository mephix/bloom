const math = require('mathjs')

module.exports = sortByFirePriority

// Prioritize who's here.
function sortByFirePriority(peopleWaiting) {
  // Get current time in milliseconds
  const millisNow = (new Date()).getTime()
  peopleWaiting.map(p => {
    // Convert time diff to minutes.
    let minutes
    if (p['waitStartTime']) {
        minutes = (millisNow - p['waitStartTime'].toMillis()) / 1000 / 60
    } else {
        console.warn(`${p['firstName']} is Here and Free but has no wait start time.`)
        minutes = 1
    }
    // Score wait times <- [0,30] minutes.
    p.waitTimeScore = math.min(30, math.max(0, minutes)) / 30
    // Score posivibes (assuming it starts [0,10]).
    p.posivibesScore = (p['posivibes'] || 1) / 10
    // Multiplying wait times and posivibes yields the composite priority score.
    p.priority = p.waitTimeScore * p.posivibesScore
  })
  return peopleWaiting.sort((a,b) => (b.priority - a.priority))
}
