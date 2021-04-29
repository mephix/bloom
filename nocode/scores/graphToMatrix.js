const math = require('mathjs')

module.exports = graphToMatrix

// Convert a graph to a (symmetric or non-symmetric) matrix in the specified order.
function graphToMatrix({ graph, order, symmetric = true }) {
  // `order` is the list of ids in which order to create the matrix from
  // `graph`.
  let N = order.length
  let M = math.zeros(N, N)
  for (let i=0; i<N; i++) {
    for (let j=0; j<N; j++) {
      let symmValue = math.sqrt(graph[order[i]][order[j]] * graph[order[j]][order[i]])
      let value = symmetric ? symmValue : graph[order[i]][order[j]]
      M = math.subset(M, math.index(i, j), value || 0)
    }
  }
  return M
}