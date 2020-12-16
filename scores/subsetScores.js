
module.exports = subsetScores

// Subset scores to "top 20", say, or "all scores above 0.1".
function subsetScores(score, { top, above }) {
  return Object.fromEntries(
    Object.keys(score).map(id1 => {
      const scoresOf1 = Object.entries(score[id1])
      const byScore = ([,score1],[,score2]) => (score2 - score1)
      const sortedScoresOf1 = scoresOf1.sort(byScore)
      let filteredScoresOf1
      // Apply 'top'
      if (top) {
        filteredScoresOf1 = sortedScoresOf1.slice(0,top)
      }
      // Apply 'above'
      if (above) {
        filteredScoresOf1 = sortedScoresOf1.filter(([,score]) => (score > above))
      }
      return [id1, Object.fromEntries(filteredScoresOf1)]
    })
  )
}