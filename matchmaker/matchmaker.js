const dateClock = require('./dateClock.js')
const { addScore, tryToJoinDates, createDates } = require('./stubs.js')
const consoleColorLog = require('../utils/consoleColorLog.js')

module.exports = matchmaker

async function matchmaker(setTimer) {
  consoleColorLog('')

  // When it finishes running, the matchMaker puts itself to sleep for a
  // certain amount of time. Write a wrapper around `setTimeout` to do
  // this. Multiply by 1000 because `setTimeout` uses milliseconds.
  // setTimeout returns a timer id which can be terminated with
  // clearTimeout(timer).
  const sleepMatchMakerFor = time => {return setTimeout(matchmaker, time*1000, setTimer)}
  let timer

  // Check whether there is a date night happening currently.
  let timeTilNextDateNight = dateClock.timeTilNextDateNight(Date.now())

  // `dateClock` returns timeTilNextDateNight = -1 if there is no current
  // or future date night (maybe indicating we haven't set it properly). If
  // so, sleep til the next round.
  if (timeTilNextDateNight === -1) {
    consoleColorLog('No current or future date night found.', 'red')
    let timeTilNextRound = dateClock.timeTilNextRound(Date.now())
    timer = sleepMatchMakerFor(timeTilNextRound)
    setTimer(timer)
    return
  }

  // If there is a date night in the future but it hasn't started yet, the
  // matchMaker goes dormant until it starts.
  if (timeTilNextDateNight > 0) {
consoleColorLog(`sleeping for ${timeTilNextDateNight/1000}s`, 'red')
    timer = sleepMatchMakerFor(timeTilNextDateNight)
    setTimer(timer)
    return
  }

  // If date night has started, `dateClock` returns which interval
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

  // Attach to each current, active Date For the User,
  // the match score of the person the Date is With.
  let datesWithScore = addScore(dates, matches)

  // Try to join each of these dates, in descending order of score.
  // Return `success`=true if one of them is successfully joined.
  let threshold = 1 + maxActiveInterval - currentInterval
  const delay = dateClock.delay
  let success = await tryToJoinDates(datesWithScore, threshold + delay)

  if (success) {
    // If a date is successfully joined, the matchMaker goes dormant until
    // the next round starts.
    let timeTilNextRound = dateClock.timeTilNextRound(Date.now())
    timer = sleepMatchMakerFor(timeTilNextRound)
    setTimer(timer)
    return

  } else {
    // If a date is not successfully joined, create a bunch of dates for
    // the person's matches above a certain score threshold, then set the
    // matchMaker to run again next interval.
    let nInvites = await createDates(matches, threshold)
    let timeTilNextInterval = dateClock.timeTilNextInterval(Date.now())
    timer = sleepMatchMakerFor(timeTilNextInterval)
    setTimer(timer)
    return
  }
}
