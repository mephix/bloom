const math = require('mathjs')
const { zipcodeDistance, loadZipLatlons } = require('./zipcodeDistance.js')
// Load zipcodes.
const zipLatLons = loadZipLatlons()

exports.notself = notself
exports.gender = gender
exports.age = age
exports.location = location
exports.liked = liked
exports.liked_by = liked_by
exports.both_liked = both_liked
exports.nexted = nexted
exports.either_nexted = either_nexted
exports.dated = dated
exports.hearted = hearted
exports.posivibes = posivibes

function notself(p,q) {
  // If not checked for a missing id will cause notself to return false.
  if (!p.id || !q.id) throw new Error(`${p['First Name']} or ${q['First Name']} does not have an id`)
  return p.id !== q.id
}

function gender(p,q) {
  // Nonbinary people get matched by everyone.
  return (p['Gender Preference'] + 'X').includes(q['Gender'])
}

function age(p,q,{T=10}) {
  // Age match
  // Quadratic function peaking halfway between their lo and hi age prefs.
  // Goes to zero at T below their lo or above their hi pref.
  // To perfectly respect people's preferences, set T=0.
  let z_age_raw = -(q['Age'] - (p['Age Preference Low']-T))*(q['Age'] - (p['Age Preference High']+T))
  let z_age_norm = math.square(T + (p['Age Preference High']-p['Age Preference Low'])/2)
  // q['Age'] <= p['Age Preference High'] && q['Age'] >= p['Age Preference Low']
  let z_age = math.max(0, z_age_raw / z_age_norm)
  if (z_age < 0 || z_age > 1)
    console.warn(`Age score is ${z_age} but is supposed to be <-[0,1]`)
  return z_age
}

function location(p,q) {
  // Location match.
  // Score is <- [0,1].
  const d = zipcodeDistance(p['Zipcode'], q['Zipcode'], zipLatLons)
  // Defaulting sigs=1 means someone with a nonexistent zipcode gets a
  // z_location default of 0.5
  const sigs = (d !== -1) ? d/p['Radius'] : 1
  // Choose beta such that at distance=radius (in miles) the score is 0.5.
  const BETA = 0.69314718056
  const z_location = math.exp(-BETA*sigs)
  return z_location
}

function liked(p,q) {
  return p['Likes']?.includes(q.id) || false
}

function liked_by(p,q) {
  return q['Likes']?.includes(p.id) || false
}

function both_liked(p,q) {
  return ( p['Likes']?.includes(q.id) && q['Likes']?.includes(p.id) ) || false
}

function nexted(p,q) {
  return p['Nexts']?.includes(q.id) || false
}

function either_nexted(p,q) {
  return p['Nexts']?.includes(q.id) || q['Nexts']?.includes(p.id) || false
}

function dated(p,q) {
  return p['Dated']?.includes(q.id) || false
}

function hearted(p,q) {
  return p['Hearted']?.includes(q.id) || false
}

function posivibes(p,q) {
  return (q['Posivibes'] || q['Posivibes']===0) ? q['Posivibes'] : 1
}