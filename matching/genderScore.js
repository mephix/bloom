module.exports = genderScore

function genderScore(p,q) {
  // Nonbinary people get matched by everyone.
  return (p.genderPreference + 'X').includes(q.gender)
}