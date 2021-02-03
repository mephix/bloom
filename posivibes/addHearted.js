
module.exports = addHearted

function addHearted(users, dates) {
  dates.forEach(d => {
    i = users.findIndex(u => u.id === d.For[0])
    if (i===-1) return
    // If Heart=true, add With to For's list of people hearted.
    if (d.Heart) {
      if (users[i]['Hearted']) {
        users[i]['Hearted'].push(d.With[0])
      } else {
        users[i]['Hearted'] = d.With
      }
    }
  })
  return users
}