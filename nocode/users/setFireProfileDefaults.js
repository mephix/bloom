const math = require('mathjs')

module.exports = setFireProfileDefaults

function setFireProfileDefaults(user) {
  // Default posivibes to 1 (but keep it at 0 if set there).
  user['posivibes'] = user['posivibes']===0 ? 0 : (user['posivibes'] || 1)

  // Gender (f, m or x) default is nonbinary.
  if (!user['gender']) user['gender']='x'

  // Users are heterosexual if their gender is specified, and otherwise pansexual.
  if (!user['genderPreference']) {
    if (user['gender']==='m') user['genderPreference'] = 'f'
    if (user['gender']==='f') user['genderPreference'] = 'm'
    if (user['gender']==='x') user['genderPreference'] = 'fmx'
  }
  if (user['genderPreference']==='x')   user['genderPreference'] = 'fmx'
  if (user['genderPreference']==='all') user['genderPreference'] = 'fmx'
    
  if (!user['age'])
    // if (user['birthday']) {
    //   // new users have a birthday instead of an age.
    //   let millis = (new Date()) - user['birthday'].toDate()
    //   user['age'] = millis / 1000 / 60 / 60 / 24 / 365
    // } else
      // 40 seems like the least worst default for age.
      user['age'] = 40
    // }
  user['agePreferences'] = {
    low: user['agePreferences']?.['low'] || math.max(18, (user['age']/2)+7),
    high: user['agePreferences']?.['high'] || math.min(99, (user['age']-5)*1.5)
  }

  // Default location is set to LA.
  user['zipcode'] = Number(user['zipcode']) || 90210

  return user
}