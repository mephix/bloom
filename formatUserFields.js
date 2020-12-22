const math = require('mathjs')

module.exports = formatUserFields

function formatUserFields(user) {
  const here = user['Here'] || false
  const free = user['Free'] || true
  const posivibes = user['Posivibes'] || 1
  // Gender default is nonbinary.
  const gender = user['Gender'] || 'X'
  // Users are pansexual by default.
  const genderPreference = 
    (!user['Gender Preference'] || user['Gender Preference']==='X')
    ? 'FMX'
    : user['Gender Preference']
  // 50 seems like the least worst default for age.
  const age = user['Age'] || 50
  const agePreferenceLo = user['Age Preference Low'] || math.max(18, (age/2)+7)
  const agePreferenceHi = user['Age Preference High'] || math.min(99, (age-5)*1.5)
  // Default location is set to San Francisco (94110).
  const zip = Number(user['Zipcode']) || 94110
  const radius = Number(user['Radius']) || 50
  const dated = user['Dated']
  const liked = user['Liked']
  const nexted = user['Nexted']
  let person = {
    name: user['First Name'],
    email: user['Email'], 
    here,
    free,
    checkInTime: user['Check In Time'],
    waitStartTime: user['Wait Start Time'],
    posivibes,
    gender,
    genderPreference,
    age,
    agePreferenceLo,
    agePreferenceHi,
    zip,
    radius,
    dated, liked, nexted,
  }
  if (user['id']) person.id = user['id']
  return person
}
