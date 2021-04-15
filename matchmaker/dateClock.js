var { DateTime } = require('luxon')

// `roundMinutes` is the length of each round in minutes.
// Should always be a divisor of 60 (eg 1,2,3,4,5,6,10...)
const roundMinutes = 1

// `intervalSeconds` is the length of each interval in seconds.
// Should always be a divisor of 60.
const intervalSeconds = 2

// `maxActiveInterval` is the maximum interval at which the matchmaker is
// active.
const maxActiveInterval = 99

// `delay` is the number of intervals after being willing to send invites
// to matches with a particular score that the matchmaker should accept
// invites from matches of this score.
const delay = 10

// Debugging convenience functions.
const LOG = true
const printTime = (h,m,s,mm) =>
  `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}:${mm}`

// Calculate time remaining until the next round starts, in seconds.
function timeTilNextRound() {
  const { hour, minute, second, millisecond} = DateTime.now().toObject()
  const remainingMinutes = roundMinutes - (minute % roundMinutes)
  const remainingTime = remainingMinutes*60 - (second + millisecond/1000)
  if (LOG) {
    console.log(`Time now ${printTime(hour,minute,second,millisecond)}`)
    console.log(`timeTilNextRound: ${remainingTime.toFixed(3)}s`)
  }
  return remainingTime
}

// Calculate time remaining until the next interval starts, in seconds.
function timeTilNextInterval() {
  const { hour, minute, second, millisecond} = DateTime.now().toObject()
  const remainingSeconds = intervalSeconds - (second % intervalSeconds)
  const remainingTime = remainingSeconds - millisecond/1000
  if (LOG) {
    console.log(`Time now ${printTime(hour,minute,second,millisecond)}`)
    console.log(`timeTilNextInterval: ${remainingTime.toFixed(3)}s`)
  }
  return remainingTime
}

// Calculate which is the current number interval of the round.
function currentInterval() {
  const { hour, minute, second, millisecond} = DateTime.now().toObject()
  const elapsedMinutes = minute % roundMinutes
  const elapsedSeconds = elapsedMinutes*60 + second + millisecond/1000
  // Use `ceil` because intervals are numbered from 1.
  const elapsedIntervals = Math.ceil(elapsedSeconds / intervalSeconds)
  if (LOG) {
    console.log(`Time now ${printTime(hour,minute,second,millisecond)}`)
    console.log(`currentInterval: ${elapsedIntervals}`)
  }
  return elapsedIntervals
}

module.exports = {
  timeTilNextDateNight: () => 0,
  timeTilNextRound,
  timeTilNextInterval,
  currentInterval,
  maxActiveInterval,
  delay,
}
