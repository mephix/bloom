

const math = require('mathjs')

module.exports = setProfileDefaults

function setProfileDefaults(user) {
  user['Here'] = user['Here'] || false
  user['Finished'] = user['Finished'] || false
  // Be careful with Boolean defaults when the default is 'true'.
  user['Free'] = user['Free']===false ? false : (user['Free'] || true)
  user['Posivibes'] = user['Posivibes']===0 ? 0 : (user['Posivibes'] || 1)

  // Gender default is nonbinary.
  user['Gender'] = user['Gender'] || 'X'
  // Users are heterosexual if their gender is specified, and otherwise pansexual.
  if (!user['Gender Preference']) {
    if (user['Gender']==='M') user['Gender Preference'] =  'F'
    if (user['Gender']==='F') user['Gender Preference'] =  'M'
    if (user['Gender']==='X') user['Gender Preference'] =  'FMX'
  }
  if (user['Gender Preference']==='X')   user['Gender Preference'] =  'FMX'
  if (user['Gender Preference']==='All') user['Gender Preference'] =  'FMX'
    
  // 50 seems like the least worst default for age.
  user['Age'] = user['Age'] || 50
  user['Age Preference Low'] = user['Age Preference Low'] || math.max(18, (user['Age']/2)+7)
  user['Age Preference High'] = user['Age Preference High'] || math.min(99, (user['Age']-5)*1.5)

  // Default location is set to San Francisco (94110).
  user['Zipcode'] = Number(user['Zipcode']) || 94110
  user['Radius'] = math.min(Number(user['Radius']) || 50, 999)

  // !! These many-to-many fields get omitted if they are empty !!
  user['Prospects'] = user['Prospects'] || []
  user['Likes'] = user['Likes'] || []
  user['Nexts'] = user['Nexts'] || []
  user['Dated'] = user['Dated'] || []

  return user
}
