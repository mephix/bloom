module.exports = getWriteTime

function getWriteTime(rs) {
  // Get last result.
  let rsl = rs[rs.length-1]
  // Get a write time, doesn't matter which one.
  let wtl = rsl[0].writeTime.toDate()
  // Get hours, minutes, seconds
  let hh = wtl.getHours().toString().padStart(2, '0')
  let mm = wtl.getMinutes().toString().padStart(2, '0')
  let ss = wtl.getSeconds().toString().padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}