var { DateTime } = require('luxon');

// `roundMinutes` is the length of each round in minutes.
// Should always be a divisor of 60 (eg 1,2,3,4,5,6,10...)
const roundMinutes = 5

// `intervalSeconds` is the length of each interval in seconds.
// Should always be a divisor of 60.
const intervalSeconds = 5

// `maxActiveInterval` is the maximum interval at which the matchmaker is
// active.
const maxActiveInterval = 99

// `delay` is the number of intervals after being willing to send invites
// to matches with a particular score that the matchmaker should accept
// invites from matches of this score.
const delay = 10

function timeTilNextRound() {
  const { minute, second, millisecond} = DateTime.now().toObject()
  const remainingMinutes = roundMinutes - (minute % roundMinutes)
  const remainingTime = remainingMinutes*60 + second + millisecond/1000
  return remainingTime
}

function timeTilNextInterval() {
  const { second, millisecond} = DateTime.now().toObject()
  const remainingSeconds = intervalSeconds - (second % intervalSeconds)
  const remainingTime = remainingSeconds + millisecond/1000
  return remainingTime
}

function currentInterval() {
  const { minute, second, millisecond} = DateTime.now().toObject()
  const elapsedMinutes = minute % roundMinutes
  const elapsedSeconds = elapsedMinutes*60 + second + millisecond/1000
  // Use `ceil` because intervals are numbered from 1.
  const elapsedIntervals = Math.ceil(elapsedSeconds / intervalSeconds)
  return elapsedIntervals
}

const dateClock = {
  timeTilNextDateNight: () => 0,
  timeTilNextRound,
  timeTilNextInterval,
  currentInterval,
  maxActiveInterval,
  delay,
}

export default dateClock
