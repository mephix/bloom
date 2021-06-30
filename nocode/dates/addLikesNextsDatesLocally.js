const fs = require('fs')
const consoleColorLog = require('../utils/consoleColorLog.js')

module.exports = addLikesNextsDatesLocally

function addLikesNextsDatesLocally(usersHere, today) {
  // Get latest downloaded collections.
  let likes = loadLocally('Likes')
  let nexts = loadLocally('Nexts')
  let dates = loadLocally('Dates')

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
      ...dates.filter(d => d.for===u.id && d.timeJoined.for && d.timeJoined.with).map(d => d.with),
      ...dates.filter(d => d.with===u.id && d.timeJoined.for && d.timeJoined.with).map(d => d.for)
    ])]
  })
  return usersHere
}

function loadLocally(type) {
  let filename = `${type} ${today}.json`
  try { 
    let data = JSON.parse(fs.readFileSync(`../output/${filename}`, 'utf8'))
    return data
  } catch {
    colorConsoleLog(`${filename} not found.`)
    return []
  }
}
