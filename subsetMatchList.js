const math = require('mathjs')

module.exports = subsetMatchList

function subsetMatchList( matchMatrix, peopleHere, nSlots ) {
  // peopleHere is sorted in descending order of posivibes.
  const N = peopleHere.length
  // M is the match matrix subsetted to the people who showed up.
  let M = math.zeros(N,N).valueOf()
  for (let i=0; i<N; i++) {
    for (let j=0; j<N; j++) {
      // The default value for the matrix is zero (no match).
      M[i][j] = matchMatrix[peopleHere[i].email]
        ? (matchMatrix[peopleHere[i].email][peopleHere[j].email] || 0)
        : 0
      // At the moment match scores are symmetric. There's no such thing as "Amel is a great match
      // for John but John is a bad match for Amel". It has to be, "John and Amel are a good match."
      M[j][i] = M[i][j]
    }
  }
  // Copy the match subset matrix to each date slot.
  let Ms = math.zeros(nSlots).valueOf().map( k => M )
  return Ms
}