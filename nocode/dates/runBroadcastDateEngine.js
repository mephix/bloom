/*
 ** SET THESE PARAMS
 */
let DAY = '2021-07-16'
let HOUR = '15'
let useTestIds = false  // `false` for real rounds.

/*
 * Length of dates.
 * Timezone offset switches between 07:00 and 08:00 with daylight saving.
 */
const ROUND_MINUTES = 5 // in minutes. Must be a divisor of 60.
const INTERVAL_SECONDS = 1 // in seconds.
const TIMEZONE_OFFSET = '-07:00'
const ROUND_PREENTRY = 1

const consoleColorLog = require('../utils/consoleColorLog.js')
const dateClockConstructor = require('../matchmaker/dateClock.js')
const dateClock = dateClockConstructor(ROUND_MINUTES, INTERVAL_SECONDS)
const daily = require('../apis/dailyApi.js')
const getWriteTime = require('../utils/getWriteTime.js')

runBroadcastDateEngine()

async function runBroadcastDateEngine() {

  // Get which interval of the round we are currently in.
  // (intervals start from 1, not 0).
  // If it is past the `maxActiveInterval` in the round, the Broadcast Date Engine doesn't run.
  // ?? Don't supply current time to the dateClock fns, so each successive call will use a slightly
  // ?? later time.
  let currentTime = Date.now()
  let currentInterval = dateClock.currentInterval()
  const maxActiveInterval = dateClock.maxActiveInterval
  if (currentInterval <= maxActiveInterval) {
    consoleColorLog(`Running Broadcast Date Engine for interval ${currentInterval} (at ${currentTime}).`, 'cyan')
  } else {
    let timeTilNextRound = dateClock.timeTilNextRound()
    consoleColorLog(`Current interval ${currentInterval} is higher than the maximum active interval, ${maxActiveInterval}.`, 'cyan')
    consoleColorLog(`Sleeping for ${timeTilNextRound} until the next round.`, 'cyan')
    return
  }

  // Get who showed up at any point tonight.
  let dateNightStart = new Date(DAY + 'T' + HOUR + ':00')
  let waitStartTimes = new Map()
  let querySnapshot = await db.collection('Users-dev')
    .where('waitStartTime', '>', db.Timestamp.fromDate(dateNightStart))
    .get()
  querySnapshot.docs.forEach(doc => { waitStartTimes.set(doc.id, doc.data().waitStartTime) })

  // Get who's `here` and `free`
  let usersToBroadcast = new Map()
  if (!useTestIds) {
    // A real round should always use this option.
    let querySnapshot = await db.collection('UserStatuses')
      .where('here', '==', true)
      .where('free', '==', true)
      .get()
    querySnapshot.docs.forEach(doc => { usersToBroadcast.set(doc.id, doc.data()) })
  } else {
    // Only use this option for testing.
    let hereIds = [
      // 'DItEowVmZMdMANWR4Q6E01v7SVv1', // Tasha
      // 'Kfo4fhNY9bfLoFdIMdmXNPu7UB22', // Andy
      // 'rENCRuRmF6gBxAQsS4E1qqna23L2', // Amel
      'TTfy4kFpc2gKZ7aOb1F7VUrDx4F3', // Lauren
      '4IizDnXG2WfJsAT8gbZUDVL78S42', // John
    ]
    let userStatusDefaults = { here: true, free: true, finished: false}
    hereIds.forEach(id => { usersToBroadcast.set(id, userStatusDefaults) })
  }
  consoleColorLog(`${usersToBroadcast.length} people are here and free.`)
  // ? keep id as a data field ?
  // querySnapshot.docs.forEach(doc => { usersToBroadcast.set(doc.id, { id: doc.id, ...doc.data() }) })

  // Filter out who is `finished`.
  // This filter could be added to the Firestore query,
  // but doing it here lets us see who is finished.
  usersToBroadcast = new Map([...usersToBroadcast].filter(([k, v]) => !v.finished))
  if (usersToBroadcast.length > 0) {
    consoleColorLog(`${usersToBroadcast.length} people are here, free and not finished.`)
  } else {
    consoleColorLog(`Nobody is here, free and not finished. Exiting`, 'red')
    return
  }

  // Load the matches pre-computed for this round by `runBroadcastMatchEngine`.
  // todo: pre-compute matches by writing `runBroadcastMatchEngine`.
  let matches = loadMatches(THIS_ROUND_MATCHES_FILE)

  // Load dates already created during this round.
  let existingDates = readCsv(THIS_ROUND_DATES_FILE)

  // Generate all possible dates this round for the people being broadcasted.
  // Exclude the ones with score below the currentInterval's cutoff.
  // ?? Later: replace currentInterval with f(currentInterval)
  let score_min = currentInterval
  let allDates = broadcastDateEngine(usersToBroadcast, matches, score_min)

  // Exclude dates that have already been created.
  // Add current roundStartTime to `allDates` to distinguish them from dates in past rounds.
  const { roundStartTime, roundEndTime } = dateClock.currentRoundStartEnd()
  allDates.forEach(d => {
    d.startTime = roundStartTime
    d.endTime = roundEndTime
  })
  let newDates = allDates.filter(d => !existingDates.some(e => dateEquality(d,e)))

  // Pick ones to generate notifications for.
  let notifiableDates = pickNotifiableDates(newDates)

  // Exclude from `goodEnoughDates` dates with people who didn't show up at some
  // point during tonight's date night. `waitStartTimes` only contains wait
  // start times for people who did. Also exclude any dates that are already
  // listed in `notifiableDates`.
  let tonightsPeopleDates = newDates.filter(d => waitStartTimes[d.for])
  tonightsPeopleDates = tonightsPeopleDates.filter(d => !notifiableDates.some(e => dateEquality(d,e)))

  // The final set of dates is notifiableDates (ones that we want to notify
  // people about) plus tonightsPeopleDates (ones that have a chance of being
  // accepted via someone switching back into the waiting room) that aren't
  // notifiable.
  let dates = [...tonightsPeopleDates, ...notifiableDates]

  if (dates.length > 0) {
    // save the Dates locally.
    writeToCsv([...existingDates, ...dates], THIS_ROUNDS_DATES_FILE)

    // Add Daily { nbf, exp } times to dates.
    // Don't make rooms or tokens for these broadcast dates.
    // The app should do that when it accepts a date.
    console.log(`Adding Daily times to Dates...`)
    await Promise.all(dates.map(date => {
      date.nbf = daily.calcNbf({ startTime: date.startTime, preentry: ROUND_PREENTRY })
      date.exp = daily.calcExp({ endTime: date.endTime })
    }))

    // Post the dates.
    const rs = await Promise.all(dates.map(date => postBroadcastDateToFirebase(date)))
    consoleColorLog(`${rs.length} dates posted to Firebase at ${getWriteTime(rs)}`, 'green', 'bold')

    // Generate notifications for selected dates.
    sendNotifications(notifiableDates)
    
  } else {
    consoleColorLog(`No dates created. Exiting`, 'red')
  }
}

// `dateEquality` tests if two dates are the same.
function dateEquality(d1, d2) {
  return (
    d1.for === d2.for &&
    d1.with === d2.with &&
    d1.roundStartTime === d2.roundStartTime
  )
}