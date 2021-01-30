import math from 'mathjs'

export function posivibesEngine(P, v) {
  const [m, n] = P.size()
  if (m !== n) throw new Error(`P must be a square matrix`)

  // The default for self-value v is 0 for everyone. In future versions
  // (such as with paying customers) a more appropriate default may be 1
  // for everyone.
  if (!v) v = math.zeros(n, 1)
  const I = math.identity(n, n, 'sparse')

  // Equation for the value of nodes to the network
  // w = inv(I-P) * v
  // If someone doesn't increase the marginal probability of anyone else
  // staying, their value will be their base value, v. The more they
  // increase the probability of others of value staying, the more their
  // value increases.
  const w = math.lusolve(math.subtract(I,P), v)

  // Normalize w (0-10). As a dense matrix, w gets stored as an array of
  // arrays. While normalizing, we also convert to a simple array.
  const MAX = 10
  const NSIGFIGS = 2
  const wmax = math.max(w)
  const wn = w.valueOf().map(ww => Number((ww[0]/wmax*MAX).toFixed(NSIGFIGS)))
  
  return wn
}

