
module.exports = addProfiles

function addProfiles({ users, profiles }) {
  return users.map(user => {
    let profile = profiles.filter(p => p.id === user['Profile'][0])
    if (profile.length === 0) throw new Error(`Profile for user ${user['Email']} not found.`)
    else if (profile.length > 1) throw new Error(`More than one profile for user ${user['Email']} found.`)
    else profile = profile[0]
    return { ...user, profile}
  })
}