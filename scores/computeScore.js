const computeSubScore = require('./computeSubScore.js')

/*
 * computeScore computes sub-scores in the order in which they are
 * supplied. The idea is to compute sub-scores with a lot of zeros first
 * (like gender), and sub-scores with few zeros (like location) last. This
 * keeps the computation as quick as possible and the score graph sparse.
 */
module.exports = computeScore

function computeScore (people, subScores) {
  let compositeScore = []
  for (const [pid, p] of Object.entries(people)) {
    compositeScore[pid] = []
    for (const [qid, q] of Object.entries(people)) {
      // Initialize composite score.
      let z = 1
      // Go through sub scores in order.
      // Its better for ones which will produce more zeros to come first.
      for (const [type, s] of Object.entries(subScores)) {
        if (!s.score[pid]) s.score[pid] = []
        // Record this sub-score before transforming it.
        s.score[pid][qid] = computeSubScore[type](p, q, s.params)
        // Add it to the composite score after transforming it.
        z *= s.transform(s.score[pid][qid]) * s.weight
        // If a score is zero, short-circuit.
        // Don't bother to compute further scores.
        if (!z) break
      }
      // Only record non-zeros, to keep composite score sparse.
      if (z) compositeScore[pid][qid] = z
    }
  }
  return { score: compositeScore, subScores, peopleById: people }
}