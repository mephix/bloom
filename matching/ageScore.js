module.exports = ageScore

function ageScore(p,q) {
  // Age match
  // Quadratic function peaking halfway between their lo and hi age prefs.
  // Goes to zero at T below their lo or above their hi pref.
  // To perfectly respect people's preferences, set T=0.
  const T = 10
  let z_age_raw = -(q.age - (p.agePreferenceLo-T))*(q.age - (p.agePreferenceHi+T))
  let z_age_norm = math.square(T + (p.agePreferenceHi-p.agePreferenceLo)/2)
  // q.age <= p.agePreferenceHi && q.age >= p.agePreferenceLo
  let z_age = math.max(0, z_age_raw / z_age_norm)
  if (z_age < 0 || z_age > 1)
    console.warn(`Age score is ${z_age} but is supposed to be <-[0,1]`)
  return z_age
}