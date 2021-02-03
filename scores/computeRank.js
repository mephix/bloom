
const math = require('mathjs')
const Matrix = require('ml-matrix')
const Plotly = require('plotly')
const markovize = require('./markovize.js')

module.exports = computeRank

function computeRank(score, params = { scale: { min: 1 }, nsigfigs: 2 }) {
  // Params can include scale.min, scale.max and nsigfigs.
  // `scale.max` scales to a maximum rank (eg 10) rather than a minimum rank
  // (eg 1).

  // Markovize.
  let P = markovize(score)

  // Compute maximum eigval.
  // If there are zero columns, these will lead to zero eigenvalues and the
  // largest eigval will be less than 1. If there are no zero columns, the
  // largest eigval will be 1.
  const e = new Matrix.EigenvalueDecomposition(P)
  let emax = math.max(e.realEigenvalues)
  console.log(`Largest eigval found is ${emax.toFixed(4)}`)

  // Compute eigvec of the maximum eigval.
  let vmaxidx = e.realEigenvalues.findIndex(ei => ei === emax)
  let vmax = e.eigenvectorMatrix.getColumn(vmaxidx) 

  // Calculate scaling factor.
  let scale
  // Calculate both max and min to sign eigvec positively.
  const vimax = math.max(vmax)
  const vimin = math.min(vmax)
  if (params.scale.max) {
    // Scale to a maximum posivibes of `maxscale`.
    scale = (math.abs(vimin) > math.abs(vimax) ? vimin : vimax) / params.scale.max
  } else {
    // Scale to a minimum posivibes of `minscale`.
    scale = (math.abs(vimin) > math.abs(vimax) ? vimax : vimin) / params.scale.min
  }

  // Scale and round vmax.
  const rank = vmax.map(vi => Number((vi / scale).toFixed(params.nsigfigs)))
  
  return rank
}

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