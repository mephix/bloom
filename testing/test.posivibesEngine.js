const math = require('mathjs')
const markovize = require('../posivibes/markovize.js')
const posivibesEngine = require('../posivibes/posivibesEngine.js')
const mlMatrix = require('ml-matrix')

testPosivibesEngine()

async function testPosivibesEngine() {

  // let A = [
  //   [0,         0.6,      1],
  //   [0.300,     0,        0.8],
  //   [0,         0.3,      0]
  // ]

  // let A = [
  //   [0,  0.4,   0.2],
  //   [0,  0,     0.8],
  //   [1,  0.6,   0]
  // ]

  let A = [
    [0,  1,   1],
    [0,  0,   0.8],
    [0,  0.6, 0]
  ]

  // let J = markovize(math.matrix(A))
  // const M = new mlMatrix.Matrix(J.valueOf())
  // const e = new mlMatrix.EigenvalueDecomposition(M)
  // console.log(`${e.realEigenvalues}`)
  // let kk = e.realEigenvalues.findIndex(ei => math.abs(ei-1)<10**(-7))
  // if (kk>-1) console.log(`Eigval 1 found`)
  // let vv = e.eigenvectorMatrix.valueOf().data.map(row => row[kk])
  // console.log(`Raw eigvec: ${vv.map(v => v.toFixed(3))}`)



  const P = math.matrix(A)
  const Pm = markovize(P) // P
  // const v = math.ones(3, 1)
  let w = posivibesEngine(Pm)
  console.log(`Posivibes:`)
  math.forEach(w, wi => console.log(`${wi.toFixed(2)}`))
}
