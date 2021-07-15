/*
 * Get which round it is and what time in the round
 * Get who's `here` and `free`
 * Compute matches for these people
 * Get which dates have already been sent
 * Send dates that are (1) above the match cutoff and (2) haven't already been sent
 * Generate notifications for selected dates
 */

// ! Get which interval
// of the round we are currently in. Intervals start from 1, not 0.
let currentInterval = dateClock.currentInterval(Date.now())

// If it is past the `maxActiveInterval` in the round, the
// matchMaker goes dormant until the next round starts. 
const maxActiveInterval = dateClock.maxActiveInterval
if (currentInterval > maxActiveInterval) {
  let timeTilNextRound = dateClock.timeTilNextRound(Date.now())
consoleColorLog(`sleeping for timeTilNextRound ${timeTilNextRound}`, 'cyan')
  timer = sleepMatchMakerFor(timeTilNextRound)
  setTimer(timer)
  return
}
