const consoleColorLog = require('../utils/consoleColorLog.js')

exports.addScore = (dates, matches) => {
  dates.forEach(date => {
    if (matches[date.with] !== undefined) date.score = matches[date.with]
    else date.score = 1
  })
  return dates
}

exports.tryToJoinDates = async (datesWithScore, bar) => {
  console.log(`Trying to join dates with score >= ${bar}...`)
  let joinableDates = datesWithScore.filter(d => d.score >= bar).sort((d1,d2) => d1.score < d2.score)
  if (joinableDates.length > 0) {
    consoleColorLog(`SUCCESS. Date joined.`, 'green')
    return true
  } else return false
}

exports.createDates = async (matches, threshold) => {
  console.log(`Creating dates for matches <- [${threshold},${threshold+1})...`)
  let invitablePeople = Object.keys(matches).filter(k => matches[k] >= threshold && matches[k] < threshold+1)
  if (invitablePeople.length > 0) {
    consoleColorLog(`${invitablePeople.length} invites sent at score ${threshold}.`, 'white')
    return invitablePeople.length
  } else {
    consoleColorLog(`${invitablePeople.length} invites sent.`, 'blue')
    return 0
  }
}