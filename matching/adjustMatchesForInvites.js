
module.exports = adjustMatchesForInvites

function adjustMatchesForInvites(matchGraph, inviteGraph, usersById) {
  // !! later: Deep copy matchGraph.
  let adjustedMatchGraph = matchGraph
  const ids = Object.keys(usersById)
  ids.forEach( id1 => {
    const e1 = usersById[id1].email
    ids.forEach ( id2 => {
      if (id1 === id2) return
      const e2 = usersById[id2].email
      // "either is no" is defined as either of them declining.
      const either_is_no = 
        (Boolean(inviteGraph[e1][e2]) && Boolean(inviteGraph[e2][e1])) && (
          (inviteGraph[e1][e2] === 'declined') ||
          (inviteGraph[e2][e1] === 'declined')
        )
      // "both are yes" is defined as either of them accepting the other, or both
      // accepting a system invite.
      const both_are_yes = 
        (Boolean(inviteGraph[e1][e2]) && Boolean(inviteGraph[e2][e1])) && (
             (inviteGraph[e1][e2] === 'accepted' && inviteGraph[e2][e1] === 'accepted')
          || (inviteGraph[e1][e2] === 'accepted' && inviteGraph[e2][e1] === 'invited')  
          || (inviteGraph[e1][e2] === 'invited'  && inviteGraph[e2][e1] === 'accepted')
        )
      // "invited" is defined as one or both of them not responding to the invite yet.
      const pending = 
        (!inviteGraph[e1][e2] &&  inviteGraph[e2][e1]) ||
        ( inviteGraph[e1][e2] && !inviteGraph[e2][e1]) ||
        (inviteGraph[e1][e2] === 'invited' && inviteGraph[e2][e1] === 'invited')
      const nothing = !inviteGraph[e1][e2] && !inviteGraph[e2][e1]

      if (either_is_no) {
        adjustedMatchGraph[e1][e2] = 0
        adjustedMatchGraph[e2][e1] = 0
      } else if (both_are_yes) {
        adjustedMatchGraph[e1][e2] = 10
        adjustedMatchGraph[e2][e1] = 10
      } else if (pending) {
        // Pending is better than nothing.
        const PENDING_BOOST = 7/5
        adjustedMatchGraph[e1][e2] = PENDING_BOOST * matchGraph[e1][e2]
        adjustedMatchGraph[e2][e1] = PENDING_BOOST * matchGraph[e2][e1]
      } else if (nothing) {
        // Not strictly necessary to set these values as adjustedMatchGraph
        // is initialized to matchGraph.
        adjustedMatchGraph[e1][e2] = matchGraph[e1][e2]
        adjustedMatchGraph[e2][e1] = matchGraph[e2][e1]
      } else {
        // Logic check. either_is_no, both_are_yes, pending and nothing are supposed
        // to cover all cases.
        throw new Error(`Unexpected logic condition for inviteGraph ${inviteGraph[e1][e2]} and ${inviteGraph[e2][e1]}`)
      }
    })
  })
  return adjustedMatchGraph
}