exports.getWriteTime = getWriteTime
exports.printTime = printTime

function getWriteTime(rs) {
  // Get last result.
  let rsl = rs[rs.length-1]
  // Get a write time, doesn't matter which one.
  let t = rsl[0].writeTime.toDate()
  return printTime(t)
}

function printTime(t) {
  // Get hours, minutes, seconds
  let hh = t.getHours().toString().padStart(2, '0')
  let mm = t.getMinutes().toString().padStart(2, '0')
  let ss = t.getSeconds().toString().padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}