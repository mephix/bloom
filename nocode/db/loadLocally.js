const fs = require('fs')
const consoleColorLog = require('../utils/consoleColorLog.js')

module.exports = loadLocally

function loadLocally(type, today) {
  let filename = `firebase ${type} ${today}.json`
  try { 
    let data = JSON.parse(fs.readFileSync(`./nocode/output/${filename}`, 'utf8'))
    return data
  } catch {
    consoleColorLog(`${filename} not found.`, 'red')
    return []
  }
}