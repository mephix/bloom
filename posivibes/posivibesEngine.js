const math = require('mathjs')
const mlMatrix = require('ml-matrix')
const markovize = require('../posivibes/markovize.js')

module.exports = posivibesEngine

/*
 * The value, w, of users to a network, where users both have intrinsic
 * (self) value, v, and increase the probability of other users staying via
 * the probability matrix P, is:
 * w = Pw + v
 * and therefore:
 * w = inv(I-P)*v
 * If someone doesn't increase the marginal probability of anyone else
 * staying, their value should be their base value, v. The more they
 * increase the probability of others of value staying, the more their
 * value should increase.
 * 
 * In the special case where self-value v = 0, and the sum of each column
 * of P = 1 (ie, P is a true probability / stochastic / Markov matrix),
 * then w becomes the eigvec of P with eigval=1. `lusolve` will fail at
 * finding this because (I-P) is singular (by the definition of a
 * stochastic matrix). So we need another way to find w.
 */

function posivibesEngine(P, v) {
  const [m, n] = P.size()
  if (m !== n) throw new Error(`P must be a square matrix`)

  // Default to an equal self-value for everyone (1).
  let w
  if (v === undefined) {
    console.warn(`posivibesEngine is using eigvec method since v was not supplied.`)
    console.warn(`Don't forget to make sure P has been markovized.`)
    const M = new mlMatrix.Matrix(P.valueOf())
    const e = new mlMatrix.EigenvalueDecomposition(M)
    // If there are zero columns, these will lead to zero eigenvalues.
    // The largest eigval will be less than 1.
    let kk = e.realEigenvalues.findIndex(ei => ei === math.max(e.realEigenvalues))
    console.log(`Largest eigval found is ${math.max(e.realEigenvalues)}`)
    // Find the eigenvalue equal to 1.
    // let kk = e.realEigenvalues.findIndex(ei => math.abs(ei-1)<10**(-7))
    // if (kk===-1) console.error(`Eigval 1 not found.`)
    w = e.eigenvectorMatrix.valueOf().data.map(row => row[kk])
  } else {
    // `lusolve` solves the linear equation (I-P)*w = v for w. 
    const I = math.identity(n, n, 'sparse')
    w = math.lusolve(math.subtract(I,P), v)
  }

  // Normalize w.
  // Calculate both wmax and wmin to flip sign if w comes out negative.
  const wmax = math.max(w)
  const wmin = math.min(w)
  // // Scale so that the maximum is 10.
  // const wdiv = (math.abs(wmin) > math.abs(wmax) ? wmin : wmax) / 10
  // Scale so that the minimum is 1.
  const wdiv = (math.abs(wmin) > math.abs(wmax) ? wmax : wmin) / 1

  // Round to NSIGFIGS.
  const NSIGFIGS = 2
  const wnorm = w.valueOf().map(wi => Number((wi/wdiv).toFixed(NSIGFIGS)))
  
  // Return the normalized vector of values for each user.
  return wnorm
}

