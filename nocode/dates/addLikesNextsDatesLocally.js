const fs = require('fs')
const consoleColorLog = require('../utils/consoleColorLog.js')
const loadLocally = require('../db/loadLocally.js')

module.exports = addLikesNextsDatesLocally

function addLikesNextsDatesLocally(usersHere, today) {
  // Get latest downloaded collections.
  let likes = loadLocally('Likes-dev', today)
  let nexts = loadLocally('Nexts-dev', today)
  let dates = loadLocally('Dates-dev', today)

  usersHere.forEach(u => {
    // Likes & Nexts:
    // Convert refs to ids.
    // Remove duplicates.
    u.likes = [... new Set(likes[u.id]?.likes.map(r => r.id) || [])]
    u.nexts = [... new Set(nexts[u.id]?.nexts.map(r => r.id) || [])]

    // Dates:
    // Get dates both for and with.
    // Only count dates both people actually joined.
    u.dated = [... new Set([
      ...dates.filter(d => d.for===u.id && d.timeJoin?.for && d.timeJoin?.with).map(d => d.with),
      ...dates.filter(d => d.with===u.id && d.timeJoin?.for && d.timeJoin?.with).map(d => d.for)
    ])]
  })
  return usersHere
}

