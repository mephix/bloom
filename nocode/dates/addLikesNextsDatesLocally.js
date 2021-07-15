const fs = require('fs')
const consoleColorLog = require('../utils/consoleColorLog.js')
const loadLocally = require('../db/loadLocally.js')

module.exports = addLikesNextsDatesLocally

function addLikesNextsDatesLocally(usersHere, today, ONLY_COUNT_DATES_THEY_BOTH_JOINED = true) {
  // Get latest downloaded collections.
  let likes = loadLocally('Likes-dev', today)
  let nexts = loadLocally('Nexts-dev', today)
  let ln = { likes, nexts }
  let dates = loadLocally('Dates-dev', today)

  // Likes & Nexts:
  // Convert refs to ids.
  // Remove duplicates.
  let getIds = (type,id) => [... new Set(ln[type].filter(l => l.id === id)?.[0]?.[type]?.map(l => l?._path?.segments[1]) || [])]

  // Dates:
  // Get dates both for and with.
  // Only count dates both people actually joined.
  let getDated
  if (ONLY_COUNT_DATES_THEY_BOTH_JOINED) {
    getDated = (id) => [... new Set([
      ...dates.filter(d => d.for===id  && d.timeJoin?.for && d.timeJoin?.with).map(d => d.with),
      ...dates.filter(d => d.with===id && d.timeJoin?.for && d.timeJoin?.with).map(d => d.for)
    ])]
  } else {
    getDated = (id) => [... new Set([
      ...dates.filter(d => d.for===id).map(d => d.with),
      ...dates.filter(d => d.with===id).map(d => d.for)
    ])]
  }

  usersHere.forEach(u => {
    // .filter(k => k !== undefined) is a temp fix because some Likes/Nexts are phone numbers.
    u.likes = getIds('likes', u.id).filter(k => k !== undefined)
    u.nexts = getIds('nexts', u.id).filter(k => k !== undefined)
    u.dated = getDated(u.id)
  })
  return usersHere
}

