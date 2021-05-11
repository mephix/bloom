// import CronParser from 'cron-parser'
// import { db, time } from '../firebase'
// import { UsersDate } from '../store/utils/types'
import { DateClockService } from './dateClock.service'
import { consoleColorLog } from './utils'
import { Logger } from './utils/Logger'

const logger = new Logger('Matchmaker', '#005aeb')

// const DATE_NIGHT_SETTINGS = 'date_night_settings'

export class Matchmaker {
  static async launch() {
    try {
      await DateClockService.initNextDateNight()
      logger.debug('working! [temporary not...]')
      return true
    } catch (err) {
      logger.error('something went wrong during launch matchmaker \n', err)
      return false
    }
  }
}

type SetTimerFunc = (num: number) => void

async function matchmaker(setTimer: SetTimerFunc) {
  // When it finishes running, the matchMaker puts itself to sleep for a
  // certain amount of time. Write a wrapper around `setTimeout` to do
  // this. Multiply by 1000 because `setTimeout` uses milliseconds.
  // setTimeout returns a timer id which can be terminated with
  // clearTimeout(timer).
  const sleepMatchMakerFor = (time: number) => {
    return setTimeout(matchmaker, time * 1000, setTimer)
  }
  consoleColorLog('\nStarting matchmaker...', 'white')

  let timer: number

  // Check whether there is a date night happening currently.
  const timeTilNextDateNight = DateClockService.timeTilNextDateNight()

  // `dateClock` returns timeTilNextDateNight = -1 if there is no current
  // or future date night (maybe indicating we haven't set it properly). If
  // so, sleep til the next round.
  if (timeTilNextDateNight === -1) {
    consoleColorLog('No current or future date night found.', 'red')
    let timeTilNextRound = DateClockService.timeTilNextRound()
    timer = sleepMatchMakerFor(timeTilNextRound)
    setTimer(timer)
    return
  }

  // If there is a date night in the future but it hasn't started yet, the
  // matchMaker goes dormant until it starts.
  if (timeTilNextDateNight > 0) {
    consoleColorLog(`sleeping for ${timeTilNextDateNight / 1000}s`, 'red')
    timer = sleepMatchMakerFor(timeTilNextDateNight)
    setTimer(timer)
    return
  }

  // If date night has started, `dateClock` returns which interval
  // of the round we are currently in. Intervals start from 1, not 0.
  // let currentInterval = DateClockService.currentInterval()

  // If it is past the `maxActiveInterval` in the round, the
  // matchMaker goes dormant until the next round starts.
  // const maxActiveInterval = DateClockService.maxActiveInterval
  // if (currentInterval > maxActiveInterval) {
  //   let timeTilNextRound = DateClockService.timeTilNextRound()
  //   consoleColorLog(`sleeping for timeTilNextRound ${timeTilNextRound}`, 'cyan')
  //   timer = sleepMatchMakerFor(timeTilNextRound)
  //   setTimer(timer)
  //   return
}

// For the meantime in dev: if its a new round, set 'invited' back to
// for all matches
// ! InDev
// ? Where is matches array ?
// consoleColorLog(`currentInterval: ${currentInterval}`, 'white')
// if (currentInterval === 1) {
//   Object.keys(matches).map(id => (matches[id].invited = false))
// }

// Attach to each current, active Date For the User,
// the match score of the person the Date is With.
// ? let dates = await getDates(userId)
// ? Where is matches array ?
// ? let datesWithScore = addScore(dates, matches)

// Try to join each of these dates, in descending order of score.
// Return `success`=true if one of them is successfully joined.
// let threshold = 1 + maxActiveInterval - currentInterval
// const delay = DateClockService.delay
// // let success = await tryToJoinDates(datesWithScore, threshold + delay)

// if (success) {
//   // If a date is successfully joined, the matchMaker goes dormant until
//   // the next round starts.
//   let timeTilNextRound = DateClockService.timeTilNextRound()
//   timer = sleepMatchMakerFor(timeTilNextRound)
//   setTimer(timer)
//   return
// } else {
//   // If a date is not successfully joined, create a bunch of dates for
//   // the person's matches above a certain score threshold, then set the
//   // matchMaker to run again next interval.
//   // ? await createDates(matches, threshold)
//   let timeTilNextInterval = DateClockService.timeTilNextInterval()
//   timer = sleepMatchMakerFor(timeTilNextInterval)
//   setTimer(timer)
//   return
// }
// }

// async function getDates(email: string) {
//   let dates: UsersDate[] = []
//   let snapshot = await db
//     .collection('Dates')
//     .where('for', '==', email)
//     .where('active', '==', true)
//     .where('end', '>', time.now())
//     .get()
//   if (snapshot.empty) {
//     consoleColorLog(`No active, current Dates For ${email} found.`, 'blue')
//   }
//   snapshot.forEach(doc => {
//     const date = doc.data()
//     if (date.start < time.now()) {
//       dates.push({ ...date, id: doc.id } as UsersDate)
//     }
//   })
//   return dates
// }

// function tryToJoinDate(dateId) {
//   firebase.modify('Dates', dateToJoin.id, {
//     accepted: true,
//     timeReplied: firebase.db.Timestamp.now()
//   })
//   const dateRef = db.collection('Dates').doc(dateId)
//   const success = await db.runTransaction(async transaction => {
//     const date = await transaction.get(dateRef)

//     // Only accept the date if it is still active.
//     // Otherwise, do nothing.
//     if (date.data().active) {
//       const sender = date.data().with
//       const recipient = date.data().for

//       // Get all other current active dates for the recipient
//       const datesForRecipient = await transaction.get(
//         db
//           .collection(DATES_COLLECTION)
//           .where('for', '==', recipient)
//           .where('active', '==', true)
//           .where('end', '>', time.now())
//       )
//       // Get all other current active dates with the recipient
//       const datesWithRecipient = await transaction.get(
//         db
//           .collection(DATES_COLLECTION)
//           .where('with', '==', recipient)
//           .where('active', '==', true)
//           .where('end', '>', time.now())
//       )
//       // Get all other current active dates for the sender
//       const datesForSender = await transaction.get(
//         db
//           .collection(DATES_COLLECTION)
//           .where('for', '==', sender)
//           .where('active', '==', true)
//           .where('end', '>', time.now())
//       )

//       // Set accepted=false for all other current active dates for the recipient
//       datesForRecipient.map(d => {
//         transaction.update(d.ref, { accepted: false })
//       })

//       // Set active=false for all other current active dates with the recipient
//       datesWithRecipient.map(d => {
//         transaction.update(d.ref, { active: false })
//       })

//       // Set active=false for all other current active dates for the sender
//       datesForSender.map(d => {
//         transaction.update(d.ref, { active: false })
//       })

//       // Accept the date.
//       transaction.update(dateRef, {
//         accepted: true,
//         timeReplied: time.now()
//       })
//     }
//   })
//   return success
// }
