const fs = require('fs')
const consoleColorLog = require('../utils/consoleColorLog.js')
const loadLocally = require('../db/loadLocally.js')
const addLikesNextsDates = require('./addLikesNextsDates.js')

module.exports = addLikesNextsDatesLocally

function addLikesNextsDatesLocally(users, today, ONLY_COUNT_DATES_THEY_BOTH_JOINED = true) {
  // Get latest downloaded collections.
  let likes = loadLocally('Likes-dev', today)
  let nexts = loadLocally('Nexts-dev', today)
  let dates = loadLocally('Dates-dev', today)

  return addLikesNextsDates(users, likes, nexts, dates, ONLY_COUNT_DATES_THEY_BOTH_JOINED)
}

