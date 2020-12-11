
module.exports = adjustMatchesForDates

function adjustMatchesForDates(matchGraph, dateGraph, usersById) {
  // !! later: Deep copy matchGraph.
  let adjustedMatchGraph = matchGraph
  const ids = Object.keys(usersById)
  ids.forEach( id1 => {
    const e1 = usersById[id1].email
    if (!dateGraph[e1]) return
    ids.forEach( id2 => {
      if (id1 === id2) return
      const e2 = usersById[id2].email

      // If they've had a date already, do not match. This must be done
      // after invites. Make sure to set the score to zero both ways, because
      // a date can be recorded only one way.
      if (dateGraph[e1][e2]) {
        adjustedMatchGraph[e1][e2] = 0
        adjustedMatchGraph[e2][e1] = 0
      }
    })
  })
  return adjustedMatchGraph
}