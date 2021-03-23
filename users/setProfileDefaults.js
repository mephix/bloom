module.exports = setProfileDefaults

const math = require('mathjs')
const fs = require('fs')
const cityToZipcode = JSON.parse(fs.readFileSync(`./scores/cityToZipcode.json`, 'utf8'))
const genderMap = { 1: 'F', 2: 'M', 3: 'X' }
const gprefMap  = { 'F': 1, 'M': 2, 'All': 3 }

function setProfileDefaults(user) {
  if (user['firstName'] && !user['First Name']) {
    user['First Name'] = user['firstName']
  }

  user['Here'] = user['Here'] || false
  user['Finished'] = user['Finished'] || false
  // Be careful with Boolean defaults when the default is 'true'.
  user['Free'] = user['Free']===false ? false : (user['Free'] || true)
  user['Posivibes'] = user['Posivibes']===0 ? 0 : (user['Posivibes'] || 1)

  // If 'Gender' didn't get set, try to fill it in via 'Gender Selection'
  // which gets set on the very first signup screen.
  if (!user['Gender']) {
    if (user['Gender Selection']) {
      user['Gender'] = genderMap[user['Gender Selection']]
      // Gender default is nonbinary:
    } else user['Gender'] = 'X'
  }

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

  // Default location is set to San Francisco (94111).
  if (!user['Zipcode']) {
    let z
    if (user['City Selection']?.[0])
      z = cityToZipcode.find(c => c.id === user['City Selection'][0]).zipcode
    if (!z) console.warn(`No zipcode found for city with id ${user['City Selection']}`)
    user['Zipcode'] = z || 94111
  } else user['Zipcode'] = Number(user['Zipcode'])
  user['Radius'] = math.min(Number(user['Radius']) || 50, 999)

  // !! These many-to-many fields get omitted if they are empty !!
  user['Prospects'] = user['Prospects'] || []
  user['Likes'] = user['Likes'] || []
  user['Nexts'] = user['Nexts'] || []
  user['Dated'] = user['Dated'] || []

  return user
}
