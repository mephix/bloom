const math = require('mathjs')
const { zipcodeDistance, loadZipLatlons } = require('../zipcodeDistance.js')
// Load zipcodes.
const zipLatLons = loadZipLatlons()

exports.notself = notself
exports.gender = gender
exports.age = age
exports.location = location
exports.liked = liked
exports.nexted = nexted
exports.dated = dated

function notself(p,q) {
  // If not checked for a missing id will cause notself to return false.
  if (!p.id || !q.id) throw new Error(`${p.name} or ${q.name} does not have an id`)
  return p.id !== q.id
}

function gender(p,q) {
  // Nonbinary people get matched by everyone.
  return (p.genderPreference + 'X').includes(q.gender)
}

function age(p,q,{T=10}) {
  // Age match
  // Quadratic function peaking halfway between their lo and hi age prefs.
  // Goes to zero at T below their lo or above their hi pref.
  // To perfectly respect people's preferences, set T=0.
  let z_age_raw = -(q.age - (p.agePreferenceLo-T))*(q.age - (p.agePreferenceHi+T))
  let z_age_norm = math.square(T + (p.agePreferenceHi-p.agePreferenceLo)/2)
  // q.age <= p.agePreferenceHi && q.age >= p.agePreferenceLo
  let z_age = math.max(0, z_age_raw / z_age_norm)
  if (z_age < 0 || z_age > 1)
    console.warn(`Age score is ${z_age} but is supposed to be <-[0,1]`)
  return z_age
}

function location(p,q) {
  // Location match.
  // Score is <- [0,1].
  const d = zipcodeDistance(p.zip, q.zip, zipLatLons)
  const sigs = (d !== -1) ? d/p.radius : 1
  // Choose beta such that at distance=radius (in miles) the score is 0.5.
  const BETA = 0.69314718056
  const z_location = math.exp(-BETA*sigs)
  return z_location
}

function liked(p,q) {
  return p.liked?.includes(q.id) || false
}

function nexted(p,q) {
  return p.nexted?.includes(q.id) || false
}

function dated(p,q) {
  return p.dated?.includes(q.id) || false
}