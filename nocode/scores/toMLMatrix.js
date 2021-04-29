
const MLMatrix = require('ml-matrix')

module.exports = toMLMatrix

/*
 * toMLMatrix
 * Converts a graph of numerical connections between ids to a matrix.
 * Hopefully, the ml-matrix representation of it defaults to sparse. This
 * replaces `graphToMatrix` which seemed to be very slow. The ids can be
 * supplied in any order, allowing this to work with the dateEngine.
 */
function toMLMatrix(graph, ids, makeSymmetric = false) {
  let matrix
  let n = ids.length
  if (n > 0) matrix = new MLMatrix.Matrix(n, n)
  else return null
  ids.forEach((idr, r) => {
    ids.forEach((idc, c) => {
      if (!makeSymmetric) {
        // Only set the value in the matrix if it is defined in the graph.
        if (graph[idr]?.[idc]) matrix.set(r, c, graph[idr][idc])
      } else {
        let vrc = graph[idr]?.[idc]
        let vcr = graph[idc]?.[idr]
        // If both graph[r][c] and graph[c][r] are undefined, leave the
        // value unset. But if at least one of them is defined, set the
        // value as their product. If one of them is undefined or zero, of
        // course, the product will be zero.
        if (vrc !== undefined || vcr !== undefined) {
          let vsymm = (vrc || 0) * (vcr || 0)
          matrix.set(r, c, vsymm)
        }
      }
    })
  })
  return matrix
}