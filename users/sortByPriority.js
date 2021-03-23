const math = require('mathjs')

module.exports = sortByPriority

function sortByPriority(peopleWaiting) {
  // Prioritize who's here.
  const timeNow = new Date()
  peopleWaiting.map(p => {
    // Convert time diff to minutes.
    if (!p['Wait Start Time']) console.warn(`${p['First Name']} is Here and Free but has no wait start time.`)
    const milliseconds = p['Wait Start Time']
      ? timeNow - new Date(p['Wait Start Time'])
      : 0
    const minutes = milliseconds/1000/60
    // Cap wait times <- [0,30] minutes for later conversion to score.
    p.waitTime = math.max(0, math.min(30, minutes))
    // Multiplying wait times and posivibes yields the composite score.
    p.priority = p.waitTime/30 * (p['Posivibes'] || 1)/10
  })
  return peopleWaiting.sort((a,b) => (b.priority - a.priority))
}
