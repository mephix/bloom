const math = require('mathjs')

module.exports = sortByPriority

function sortByPriority(peopleWaiting) {
  // Prioritize who's here.
  const timeNow = new Date()
  peopleWaiting.map(p => {
    // Convert time diff to minutes.
    if (!p.checkInTime) console.warn(`${p.name} is Here and Free but has no check in time.`)
    const milliseconds = p.checkInTime
      ? timeNow - new Date(p.checkInTime)
      : 0
    const minutes = milliseconds/1000/60
    // Cap wait times <- [0,10] minutes for later conversion to score.
    p.waitTime = math.max(0, math.min(10, minutes))
    // Multiplying wait and posivibes scores <-[0,1] yields the composite score.
    p.priority = p.waitTime/10 * p.posivibes/10
  })
  return peopleWaiting.sort((a,b) => (b.priority - a.priority))
}
