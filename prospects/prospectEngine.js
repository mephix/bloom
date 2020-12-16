const computeScore = require('../scores/computeScore.js')

module.exports = prospectEngine

function prospectEngine (people) {
  const subScores = {
    // Show people of their gender preference.
    'gender': { transform: z => z, weight: 1, score: [] },
    // Don't show someone they've liked already.
    'liked': { transform: z => !z, weight: 1, score: [] },
    // Don't show someone they've nexted already.
    'nexted': { transform: z => !z, weight: 1, score: [] },
    // Don't show someone they've dated already.
    'dated': { transform: z => !z, weight: 1, score: [] },
    // Show people of their age preference.
    'age': { transform: z => z, weight: 1, score: [] },
    // Don't show someone themself.
    'notself': { transform: z => z, weight: 1, score: [] },
    // For prospects, the further away, the better.
    // Less chance of them being in the round.
    'location': { transform: z => (1-z), weight: 1, score: [] },
  }
  return computeScore(people, subScores)
}