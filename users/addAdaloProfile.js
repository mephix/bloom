const consoleColorLog = require('../utils/consoleColorLog.js')

module.exports = addAdaloProfile

 function addAdaloProfile(firebaseUser, adaloUserArray) {
  if (adaloUserArray.length === 0) {
    consoleColorLog(`${firebaseUser.id} has no profile in Adalo`, 'yellow')
    return firebaseUser
  }
  if (adaloUserArray.length > 1) {
    consoleColorLog(`${firebaseUser.id} has more than one profile in Adalo`, 'yellow')
    // The first associated profile will be used.
  }
  // Convert it from array.
  let adaloUser = adaloUserArray[0]
  /*
  'Here': 'here',
  'Free': 'free',
  'Finished' : 'finished',
  'Wait Start Time': 'waitStartTime',  
  */
  adaloUser['Here'] = firebaseUser['here']
  adaloUser['Free'] = firebaseUser['free']
  adaloUser['Finished'] = firebaseUser['finished']
  // Convert to string because `sortByPriority` converts from strings to
  // Dates.
  let jsdate
  if (typeof firebaseUser['waitStartTime'] === 'string') {
    jsdate = isoToDate(firebaseUser['waitStartTime'])
  } else {
    jsdate = firebaseUser['waitStartTime'].toDate()
  }
  adaloUser['Wait Start Time'] = jsdate.toString()
  return adaloUser
}

function isoToDate (iso) {
  // Converts an ISO date string like '2021-02-18T17:34:11.395Z' to a js
  // Date object.
  const [y, m, d] = iso.slice(0,10).split('-').map(s => Number(s)) 
  const [hh, mm, ss] = iso.slice(11,19).split(':').map(s => Number(s))
  return new Date(y, m, d, hh, mm, ss)
}