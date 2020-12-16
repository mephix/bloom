const math = require('mathjs')

module.exports = makeSymmetric

// Make the match graph symmetrical. If the score is only supplied one
// way, use it both ways. If scores are supplied both ways, use
// m(i,j) = sqrt(m(i,j)*m(j,i)).
function makeSymmetric (matchGraph) {
  const emails = Object.keys(matchGraph)
  emails.map(email1 => {
    const email2s = Object.keys(matchGraph[email1])
    email2s.map(email2 => {
      const score = matchGraph[email1][email2]
      if (matchGraph[email2]) {
        if (matchGraph[email2][email1]) {
          // m(i,j) = sqrt(m(i,j)*m(j,i))
          let meanscore = math.sqrt(matchGraph[email1][email2] * matchGraph[email2][email1])
          matchGraph[email1][email2] = meanscore
          matchGraph[email2][email1] = meanscore
        } else {
          matchGraph[email2][email1] = score
        }
      } else {
        matchGraph[email2] = { [email1]: score }
      }      
    })
  })
  return matchGraph
}