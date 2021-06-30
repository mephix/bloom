module.exports = addLikesNextsDatesLive

async function addLikesNextsDatesLive(db, usersHere, ONLY_COUNT_DATES_THEY_BOTH_JOINED = false) {

  // Collections can be '-dev' or not.
  const LIKES = 'Likes-dev'
  const NEXTS = 'Nexts-dev'
  const DATES = 'Dates-dev'

  // Get raw documents from their collections.
  const ids = usersHere.map(u => u.id)
  const likesDocs = await Promise.all(ids.map((id => db.collection(LIKES).doc(id).get())))
  const nextsDocs = await Promise.all(ids.map((id => db.collection(NEXTS).doc(id).get())))
  const datedForQueries  = await Promise.all(ids.map((id => db.collection(DATES).where('for', '==', id).get())))
  const datedWithQueries = await Promise.all(ids.map((id => db.collection(DATES).where('with', '==', id).get())))

  usersHere.forEach((u,i) => {
    // Likes & Nexts:
    // Convert refs to ids.
    // Remove duplicates.
    const l = likesDocs.filter(doc => doc.id === u.id)[0]
    const n = nextsDocs.filter(doc => doc.id === u.id)[0]
    u.likes = l.exists ? [... new Set(l.data().likes.map(r => r.id))] : []
    u.nexts = n.exists ? [... new Set(n.data().nexts.map(r => r.id))] : []

    // Dates For and With the user.
    let dated = []
    if (!datedForQueries[i].empty) datedForQueries[i].docs.forEach(doc => {
      let d = doc.data()
      // Only count dates they both joined?
      const condition = ONLY_COUNT_DATES_THEY_BOTH_JOINED ? d.timeJoin?.for && d.timeJoin?.with : true
      if (condition) dated.push(d.with)
    })
    if (!datedWithQueries[i].empty) datedWithQueries[i].docs.forEach(doc => {
      let d = doc.data()
      const condition = ONLY_COUNT_DATES_THEY_BOTH_JOINED ? d.timeJoin?.for && d.timeJoin?.with : true
      if (condition) dated.push(d.for)
    })
    u.dated = [... new Set(dated)]
  })
  return usersHere
}
