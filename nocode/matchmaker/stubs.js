const { DateTime } = require('luxon')
const consoleColorLog = require('../utils/consoleColorLog.js')
const firebase = require('../apis/firestoreApi.js')
const dateClock = require('./dateClock.js')
const tryToJoinDate = require('./tryToJoinDate.js')

exports.getDates = async (userId) => {
  let dates = []
  let snapshot = await firebase.db.collection('Dates')
    .where('for', '==', userId) // firebase.db.collection('Users').doc(userId))
    .where('active', '==', true)
    .where('end', '>', firebase.db.Timestamp.now())
    .get()
  if (snapshot.empty) {
    consoleColorLog(`No active, current Dates For ${userId} found.`, 'blue')
  }
  snapshot.forEach(doc => {
    let date = doc.data()
    if (date.start < firebase.db.Timestamp.now()) {
      dates.push({ ...date, id: doc.id })
    }
  })
  return dates
}

exports.addScore = (dates, matches) => {
  dates.forEach(date => {
    if (matches[date.with] !== undefined) date.score = matches[date.with].score
    else date.score = 1
  })
  return dates
}

exports.tryToJoinDates = async (datesWithScore, bar) => {
  console.log(`Trying to join dates with score >= ${bar}...`)
  let joinableDates = datesWithScore.filter(d => d.score >= bar).sort((d1,d2) => d1.score < d2.score)
  if (joinableDates.length > 0) {
    let dateToJoin = joinableDates[0]
    let result = await tryToJoinDate(dateToJoin)
    consoleColorLog(`SUCCESS. Date joined.`, 'green', 'bright')
    return true
  } else return false
}

exports.createDates = async (matches, threshold) => {
  console.log(`Creating dates for matches <- [${threshold},${threshold+1})...`)
  // !! TAKE OFF THE CAP FOR DEV !!
  let invitablePeople = Object.keys(matches)
    .filter(k => !matches[k].invited)
    .filter(k => matches[k].score >= threshold) // && matches[k] < threshold+1)
  if (invitablePeople.length > 0) {
    // !! restrict to 1 for dev !!
    invitablePeople = invitablePeople.slice(0,1)
    invitablePeople.forEach(async e => {
      let date = await makeDateForWith(e,userId)
      let res = await firebase.add('Dates', { ...date, timeSent: firebase.db.Timestamp.now() })
      matches[e].invited = true
      consoleColorLog(`Invite sent to ${e} with score ${matches[e].score}.`, 'green', 'bright')
      return
    })
    return invitablePeople
  } else {
    consoleColorLog(`${invitablePeople.length} invites sent.`, 'blue')
    return []
  }
}

const makeDateForWith = async (emailFor, emailWith) => {
  const { roundStartTime, roundEndTime } = dateClock.currentRoundStartEnd()
  return {
      for: emailFor,
      with: emailWith,
      start: firebase.db.Timestamp.fromDate(DateTime.fromISO(roundStartTime).toJSDate()),
      end: firebase.db.Timestamp.fromDate(DateTime.fromISO(roundEndTime).toJSDate()),
      active: true,
      // token: { for: null, with: null }, // fix this
      // room: null, // fix this
    }
}
