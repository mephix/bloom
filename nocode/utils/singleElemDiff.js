exports.singleElemDiff = singleElemDiff

// Helper function to get the single element of array a that is not in array
// b. If there is more than one, throws an error. 
function singleElemDiff(a, b) {
  const setB = new Set(b)
  let d = a.filter(x => !setB.has(x))
  if (d.length > 1)
    throw new Error(`Set difference has ${d.length} elements rather than 1.`)
  if (d.length === 0) { console.warn('Set difference has no elements.'); return []} 
  return d[0]
}