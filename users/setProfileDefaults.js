

const math = require('mathjs')

module.exports = setProfileDefaults

function setProfileDefaults(user) {
  user['Here'] = user['Here'] || false
  // Be careful with Boolean defaults when the default is 'true'.
  user['Free'] = user['Free']===false ? false : (user['Free'] || true)
  user['Posivibes'] = user['Posivibes']===0 ? 0 : (user['Posivibes'] || 1)
  // Gender default is nonbinary.
  user.profile['Gender'] = user.profile['Gender'] || 'X'
  // Users are heterosexual if their gender is specified, and otherwise pansexual.
  if (!user.profile['Gender Preference']) {
    if (user.profile['Gender']==='M') user.profile['Gender Preference'] =  'F'
    if (user.profile['Gender']==='F') user.profile['Gender Preference'] =  'M'
    if (user.profile['Gender']==='X') user.profile['Gender Preference'] =  'FMX'
  }
  if (user.profile['Gender Preference']==='X')   user.profile['Gender Preference'] =  'FMX'
  if (user.profile['Gender Preference']==='All') user.profile['Gender Preference'] =  'FMX'
    
  // 50 seems like the least worst default for age.
  user.profile['Age'] = user.profile['Age'] || 50
  user.profile['Age Preference Low'] = user.profile['Age Preference Low'] || math.max(18, (user.profile['Age']/2)+7)
  user.profile['Age Preference High'] = user.profile['Age Preference High'] || math.min(99, (user.profile['Age']-5)*1.5)
  // Default location is set to San Francisco (94110).
  user.profile['Zipcode'] = Number(user.profile['Zipcode']) || 94110
  user.profile['Radius'] = math.min(Number(user.profile['Radius']) || 50, 999)

  // !! These M2M fields get omitted if they are empty !!
  user['Prospects'] = user['Prospects'] || []
  user['Likes'] = user['Likes'] || []
  user['Nexts'] = user['Nexts'] || []
  user['Dated'] = user['Dated'] || []

  return user
}
