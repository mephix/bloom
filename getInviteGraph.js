const helpers =  require('./helperFunctions.js')

// Make a list (email1, email2, relationship) of people who have already
// dated or accepted or declined each other's invitations.
module.exports = getInviteGraph

function getInviteGraph (invites, usersById) {
  // Initialize invites
  let inviteRelationships = []
  Object.keys(usersById).forEach(id => {
    inviteRelationships[usersById[id].email] = []
  })
  // Look through Invites for 'invited', 'accepted' and 'declined'.
  invites.forEach(i => {
    // Check for duds
    if (!i['Invited'] || i['Invited'].length < 2) return
    // User invite
    if (i['Inviter'] && i['Inviter'].length > 0) {
      // Back out inviter and invitee.
      const inviter = helpers.singleElemDiff(i['Inviter'], [])
      const invitee = helpers.singleElemDiff(i['Invited'], i['Inviter'])
      const activeEmail = usersById[inviter].email
      const passiveEmail = usersById[invitee].email

      // Add first relationship - 'invited'
      inviteRelationships[activeEmail][passiveEmail] = 'invited'

      // Add second relationship - 'declined'
      if (i['Declined'] && i['Declined'].length > 0) {
        inviteRelationships[passiveEmail][activeEmail] = 'declined'

        // Add second relationship - 'accepted'
      } else if (i['Accepted'] && i['Accepted'].length > 1) {
        inviteRelationships[passiveEmail][activeEmail] = 'accepted'
      }

      // Bloom Invite
    } else {
      const id1 = i['Invited'][0]
      const id2 = i['Invited'][1]
      const firstEmail = usersById[id1].email
      const secondEmail = usersById[id2].email
      if (i['Accepted'] && i['Accepted'].indexOf(id1) > -1) {
        inviteRelationships[firstEmail][secondEmail] = 'accepted'
      }
      if (i['Accepted'] && i['Accepted'].indexOf(id2) > -1) {
        inviteRelationships[secondEmail][firstEmail] = 'accepted'
      }
      if (i['Declined'] && i['Declined'].indexOf(id1) > -1) {
        inviteRelationships[firstEmail][secondEmail] = 'declined'
      }
      if (i['Declined'] && i['Declined'].indexOf(id2) > -1) {
        inviteRelationships[secondEmail][firstEmail] = 'declined'
      }
    }
  })
  return inviteRelationships
}