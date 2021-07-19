

function addLikesNextsDates(users, likes, nexts, dates, ONLY_COUNT_DATES_THEY_BOTH_JOINED) {
  // Likes & Nexts:
  // Convert refs to ids.
  // Remove duplicates.
  let ln = { likes, nexts }
  let getIds = (type,id) => [... new Set(ln[type].filter(l => l.id === id)?.[0]?.[type]?.map(l => l?._path?.segments[1]) || [])]

  // Dates:
  // Get dates both for and with.
  // Only count dates both people actually joined.
  let getDated
  if (ONLY_COUNT_DATES_THEY_BOTH_JOINED) {
    getDated = (id) => [... new Set([
      ...dates.filter(d => d.for===id  && d.timeJoin?.for && d.timeJoin?.with).map(d => d.with),
      ...dates.filter(d => d.with===id && d.timeJoin?.for && d.timeJoin?.with).map(d => d.for)
    ])]
  } else {
    getDated = (id) => [... new Set([
      ...dates.filter(d => d.for===id).map(d => d.with),
      ...dates.filter(d => d.with===id).map(d => d.for)
    ])]
  }

  users.forEach(u => {
    // .filter(k => k !== undefined) is a temp fix because some Likes/Nexts are phone numbers.
    u.likes = getIds('likes', u.id).filter(k => k !== undefined)
    u.nexts = getIds('nexts', u.id).filter(k => k !== undefined)
    u.dated = getDated(u.id)
  })
  return users
}

module.exports = addLikesNextsDates