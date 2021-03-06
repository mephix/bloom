const consoleColorLog = require('../utils/consoleColorLog.js')

module.exports = addAdaloProfile

 function addAdaloProfile(firebaseUser, adaloUserArray) {
  let adaloUser = {}
  if (adaloUserArray.length === 0) {
    consoleColorLog(`${firebaseUser.firstName} (${firebaseUser.id}) has no profile in Adalo`, 'yellow')
    adaloUser['Age'] = firebaseUser['age']
    adaloUser['Gender'] = firebaseUser['gender'].toUpperCase()
    adaloUser['id'] = firebaseUser['id']
    adaloUser['First Name'] = firebaseUser['firstName']
  } else if (adaloUserArray.length > 1) {
    consoleColorLog(`${firebaseUser.id} has more than one profile in Adalo`, 'yellow')
    // The first associated profile will be used.
    // Convert it from array.
    adaloUser = adaloUserArray[0]
  } else {
    adaloUser = adaloUserArray[0]
  }
  /*
  'Here': 'here',
  'Free': 'free',
  'Finished' : 'finished',
  'Wait Start Time': 'waitStartTime',  
  */
  adaloUser['Here'] = firebaseUser['here']
  adaloUser['Free'] = firebaseUser['free']
  adaloUser['Finished'] = firebaseUser['finished']
  adaloUser['devId'] = firebaseUser['id']
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