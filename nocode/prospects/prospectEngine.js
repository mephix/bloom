const computeScore = require('../scores/computeScore.js')

module.exports = prospectEngine

function prospectEngine (users) {
  // Weights should multiply to 1 or less.
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
    'age': { transform: z => z, weight: 1, score: [], params: { T: 0 } },
    // Don't show someone themself.
    'notself': { transform: z => z, weight: 1, score: [] },
    // For prospects, the further away, the better.
    // Less chance of them being in the round.
    'location': { transform: z => (1-z), weight: 1, score: [] },
    // Only show people with posivibes >=1 as Prospects.
    'posivibes': { transform: z => z>=1, weight: 1, score: [] },
  }
  // Key by id for `computeScore`.
  const usersById = []
  users.map(({ id, ...rest }) => usersById[id] = { id, ...rest })

  return computeScore(usersById, subScores)
}