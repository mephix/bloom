const adaloApi = require('./adaloApi.js')

module.exports = seeWhosHere

async function seeWhosHere () {
  // Get who's here.
  const allUsers = await adaloApi.get('Users')
  // Keep relevant fields.
  const people = allUsers
    // All we need is people's id (Email) and Posivibes score.
    .map( user => ({
      id: user['id'],
      name: user['First Name'],
      email: user['Email'], 
      posivibes: user['Posivibes'],
      here: user['Here'],
      free: user['Free'],
      checkInTime: user['Check In Time'],
    }))

  // Filter by who's checked in and not in a date.
  const peopleHere = people.filter( p => p.here && p.free)

  return { peopleHere, people }
}
