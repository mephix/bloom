// const math = require('mathjs')
const MLMatrix = require('ml-matrix')

module.exports = markovize

function markovize(P) {
  // Check that every element is positive or zero.
  if (P.min() < 0) throw new Error(`P must be >=0 numeric matrix`)

  // Divide each column by its sum.
  for (let c=0; c < P.columns; c++) {
    let sum = P.getColumnVector(c).sum()
    if (sum > 0) P.mulColumn(c, 1/sum)
  }

  return P
}
//   const [m, n] = P.size()
//   // Check every element of P is >= 0.
//   if (!P.valueOf().every(i=>i.every(j=>j>=0)))
//     throw new Error(`P must be >=0 numeric matrix`)
//   // Compute column sums.
//   let colsum = math.zeros(n)
//   P.map(function (value, index) {
//     let newvalue = math.subset(colsum, math.index(index[1])) + value
//     colsum.subset(math.index(index[1]), newvalue)
//     return newvalue // Not needed, but otherwise mathjs throws an error.
//   })
//   // // Find zero columns.
//   // colsum.map((value, index) => {
//   //   if (value===0) console.warn
//   // })
//   // Divide each element in column by its column sum.
//   const Pm = P.map(function (value, index) {
//     let cs = colsum.subset(math.index(index[1]))
//     return cs > 0 ? value / cs : cs === 0 ? 0 : console.error(`negative column sum ${cs}`)
//   })
//   return Pm
// }