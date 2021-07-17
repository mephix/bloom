var { DateTime } = require('luxon')

// Debugging convenience functions.
const LOG = true
const printTime = (h,m,s,mm) =>
  `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}:${mm}`

// Calculate time remaining until the next round starts, in seconds.
function timeTilNextRound(roundMinutes) {
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
function timeTilNextInterval(intervalSeconds) {
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
function currentInterval(roundMinutes, intervalSeconds) {
  const { hour, minute, second, millisecond} = DateTime.now().toObject()
  const elapsedMinutes = minute % roundMinutes
  const elapsedSeconds = elapsedMinutes*60 + second + millisecond/1000
  // Use `ceil` because intervals are numbered from 1.
  const elapsedIntervals = Math.ceil(elapsedSeconds / intervalSeconds)
  if (LOG) {
    // console.log(`Time now ${printTime(hour,minute,second,millisecond)}`)
    // console.log(`currentInterval: ${elapsedIntervals}`)
  }
  return elapsedIntervals
}

function currentRoundStartEnd (roundMinutes) {
  const now = DateTime.now()
  const { year, month, day, hour, minute, second, millisecond} = now.toObject()
  const elapsedMillis = (minute % roundMinutes)*60000 + second*1000 + millisecond
  const remainingMillis = roundMinutes*60000 - elapsedMillis
  // `plus` and `minus` can accept a number of milliseconds.
  const roundStartTime = now.minus(elapsedMillis).toISO({ suppressMilliseconds: true, suppressSeconds: true })
  const roundEndTime = now.plus(remainingMillis).toISO({ suppressMilliseconds: true, suppressSeconds: true })
  if (LOG) {
    console.log(`Time now:     ${now.toISO()}`)
    console.log(`Round starts: ${roundStartTime}`)
    console.log(`Round ends:   ${roundEndTime}`)
  }
  // // Convert to '2021-02-02T19:00-07:00' format
  // const makeISOTimeFrom = minute => DateTime
  //   .fromObject({ year, month, day, hour, minute })
  //   .toISO({ suppressMilliseconds: true, suppressSeconds: true })
  // const roundStartTime = makeISOTimeFrom(roundStartMinute)
  // const roundEndTime = makeISOTimeFrom(roundEndMinute)
  return { roundStartTime, roundEndTime }
}

function dateClock(
  // `roundMinutes` is the length of each round in minutes.
  // Should always be a divisor of 60 (eg 1,2,3,4,5,6,10...)
  roundMinutes = 5,

  // `intervalSeconds` is the length of each interval in seconds.
  // Should always be a divisor of 60.
  intervalSeconds = 1,

  // `maxActiveInterval` is the maximum interval at which the matchmaker is
  // active.
  maxActiveInterval = 99,

  // `delay` is the number of intervals after being willing to send invites
  // to matches with a particular score that the matchmaker should accept
  // invites from matches of this score.
  delay = 0,
) {
  return {
    timeTilNextDateNight: () => 0,
    timeTilNextRound: () => timeTilNextRound(roundMinutes),
    timeTilNextInterval: () => timeTilNextInterval(intervalSeconds),
    currentInterval: () => currentInterval(roundMinutes, intervalSeconds),
    currentRoundStartEnd: () => currentRoundStartEnd(roundMinutes),
    maxActiveInterval,
    delay,
  }
}

module.exports = dateClock
