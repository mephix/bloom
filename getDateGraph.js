const helpers =  require('./helperFunctions.js')

// Make a list of people who have already dated.
// (email1, email2, relationship)
module.exports = getDateGraph

function getDateGraph (dates, usersById) {

  // Initialize dateRelationships
  let dateRelationships = []
  Object.keys(usersById).forEach(id => {
    dateRelationships[usersById[id].email] = []
  })

  // Look through Dates for 'Participants', 'Joined', 'Matched' and 'Texted'.
  // Do it in this order, because Texted is a progression of the relationship
  // from Matched, which is a progression from Joined, which is a progression
  // from Participants (the Date was created for them, but they haven't joined
  // yet for some reason).
  dates.forEach(i => {
    // Check for duds
    if (!i['Participants'] || i['Participants'].length < 2) return
    if (i['Participants'].length > 2) throw new Error(`Date ${i.id} (${i.name}) has ${i['Participants'].length} participants.`)
    const id1 = i['Participants'][0]
    const id2 = i['Participants'][1]
    // Participants
    dateRelationships[usersById[id1].email][usersById[id2].email] = 'participants'
    dateRelationships[usersById[id2].email][usersById[id1].email] = 'participants'
    // Joined
    if (i['Joined']) i['Joined'].map(j => 
      dateRelationships[usersById[j].email][usersById[helpers.singleElemDiff([id1,id2],[j])].email] = 'joined'
    )
    // Matched
    if (i['Matched']) i['Matched'].map(j => 
      dateRelationships[usersById[j].email][usersById[helpers.singleElemDiff([id1,id2],[j])].email] = 'matched'
    )
    // Texted
    if (i['Texted']) i['Texted'].map(j => 
      dateRelationships[usersById[j].email][usersById[helpers.singleElemDiff([id1,id2],[j])].email] = 'texted'
    )
  })
  return dateRelationships
}