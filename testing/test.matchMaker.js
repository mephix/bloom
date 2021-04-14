// These functions are currently just stubs which return the constant we
// passed in via `clockParams` for testing.
let dateClock = {
  timeTilNextDateNight: (now, clockParams) => clockParams.timeTilNextDateNight,
  timeTilNextRound: (now, clockParams) => clockParams.timeTilNextRound,
  timeTilNextInterval: (now, clockParams) => clockParams.timeTilNextInterval,
  currentInterval: (now, clockParams) => clockParams.currentInterval,
}
// const dateClock = require('./dateClock.js')

testMatchmaker()

function testMatchmaker() {
  // Set up parameters to test with
  const delay = 10
  const user = { here: true, free: true }
  // Parameters to stub `dateClock` with
  const clockParams = {
    roundLength: 5*60,
    maxActiveInterval: 99,
    timeTilNextDateNight: 0,
    timeTilNextRound: 1000 * 2.5,
    timeTilNextInterval: 1000 * 3.5,
    currentInterval: 50,
  }
  // Make params object because it gets passed to setTimeout
  let params = { user, delay, clockParams }
  return matchMaker(params)
}

async function matchMaker(params) {
  const { user, delay, clockParams } = params

  // When it finishes running, the matchMaker goes dormant for a certain
  // amount of time. Write a wrapper around `setTimeout` as we use the same
  // pattern each time. 
  const sleepMatchMakerFor = time => setTimeout(matchMaker, time, params)

  // Check whether there is a date night happening currently.
  let timeTilNextDateNight = dateClock.timeTilNextDateNight(Date.now(), clockParams)

  // If there is no current or future date night, `dateClock` returns
  // timeTilNextDateNight = -1.
  if (timeTilNextDateNight === -1) {
    console.warn('No current or future date night found.')
    return
  }

  // If it is not date night currently, the matchMaker goes dormant until
  // date night starts.
  if (timeTilNextDateNight > 0) {
    sleepMatchMakerFor(timeTilNextDateNight)
    return
  }

  // If it is currently date night, `dateClock` returns which interval
  // of the round we are currently in (starting from 1 not 0).
  let currentInterval = dateClock.currentInterval(Date.now(), clockParams)

  // If it is past the `maxActiveInterval` in the round, the
  // matchMaker goes dormant until the next round starts. 
  if (currentInterval > clockParams.maxActiveInterval) {
    let timeTilNextRound = dateClock.timeTilNextRound(Date.now(), clockParams)
    sleepMatchMakerFor(timeTilNextRound)
    return
  }

  if (user.here && user.free) {
    // Attach to each current, active Date For the User,
    // the match score of the person the Date is With.
    let datesWithScore = addScore(dates, matches)

    // Try to join each of these dates, in descending order of score.
    // Return `success`=true if one of them is successfully joined.
    let threshold = t-delay
    let success = await tryToJoinDates(datesWithScore, threshold)

    if (success)  {
      // If a date is successfully joined, the matchMaker goes dormant until
      // the next round starts.
      let timeTilNextRound = dateClock.timeTilNextRound(Date.now(), clockParams)
      sleepMatchMakerFor(timeTilNextRound)
      return

    } else {
      // If a date is not successfully joined, create a bunch of dates for
      // the person's matches above a certain score threshold, then set the
      // matchMaker to run again next interval.
      let threshold = t
      await createDates(matches, threshold)
      let timeTilNextInterval = dateClock.timeTilNextInterval(Date.now(), clockParams)
      sleepMatchMakerFor(timeTilNextInterval)
      return
    }
  }
}
