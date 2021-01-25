
module.exports = addProfiles

function addProfiles({ users, profiles }) {
  return users.map(user => {
    let profile = profiles.filter(p => p.id === user['Profile']?.[0])
    if (profile.length === 0) {
      console.warn(`Profile for user ${user['Email']} not found.`)
      profile = null
    }
    else if (profile.length > 1) {
      console.warn(`More than one profile for user ${user['Email']} found.`)
      profile = profile[0]
    }
    else profile = profile[0]
    return { ...user, profile}
  })
}