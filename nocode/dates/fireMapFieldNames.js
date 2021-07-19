module.exports = fireMapFieldNames

function fireMapFieldNames(users) {
  return users.map(u => { return {
    'id': u.id,
    'Posivibes': u.posivibes,
    'Gender': u.gender.toUpperCase(),
    'Gender Preference': (typeof u.genderPreference === "string" ? u.genderPreference : u.genderPreference.join('')).toUpperCase(),
    'Age': u.age,
    'Age Preference Low': u.agePreferences.low,
    'Age Preference High': u.agePreferences.high,
    'Zipcode': u.zipcode,
    'Radius': 50,
    'Likes': u.likes,
    'Nexts': u.nexts,
    'Dated': u.dated,
  }})
}