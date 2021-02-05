/*
 * Key parameters to set
 */
const usersFile = './csvs/Users 2021-02-04.json'

const fs = require('fs')
const adaloApi = require('../apis/adaloApi.js')

copyProfileFieldsToUsers()

async function copyProfileFieldsToUsers() {
  let users = JSON.parse(fs.readFileSync(usersFile, 'utf8'))

  // Get { name: id } map for collections such as Cities, Genders etc
  const cities = await adaloApi.list('Cities', 30)
  const cityMap = []
  cities.map(({ Name, id, ...rest }) => cityMap[Name.trim()] = id)
  const genderMap = { 'F': 1, 'M': 2, 'X': 3 }
  const gprefMap  = { 'F': 1, 'M': 2, 'X': 3 }

  // Create user corresponding to profile.
  let users = []
  for (let p=0; p<profiles.length; p++) {
    users[p] = {
      'Email': profiles[p]['Email'],
      'First Name': profiles[p]['First Name'],
      'Password': profiles[p]['First Name'] + '1',
      'Here': false,
      'Free': true,
      'Finished': false,
      'RSVP': false,
      'Gender': genderMap[profiles[p]['Gender']],
      'Gender Preference': gprefMap[profiles[p]['Gender Preference']],
      'City': cityMap[profiles[p]['City'].trim()],
    }
  }

  // POST profiles and users to Adalo.
  // Choose fewer than rows.length while debugging.
  // const HOW_MANY = profiles.length
  const START = 0
  const END = 100
  profiles = profiles.slice(START, END)
  let responses = await Promise.all(profiles.map(async (profile, p) => {
    // Create User
    let userResponse = await adaloApi.create('Users', users[p])
    users[p]['id'] = userResponse.data.id
    // Create profile
    let profileResponse = await adaloApi.create('Profiles', profile)
    profile['id'] = profileResponse.data.id
    // Record connection.
    profile['Owner'] = [users[p]['id']]
    users[p]['Profile'] = profile['id']
  }))

  // Now link Profile to Owner
  let responses2 = await Promise.all(profiles.map(async (profile) => {
    // Update Profile with User id.
      console.log(`Linking profile ${profile['id']} to user ${profile['Owner']}.`)
      return adaloApi.update('Profiles', profile['id'], { 'Owner': profile['Owner'] })
  }))
  console.log(responses2.map(r=>r.statusText))
  return responses2
}
