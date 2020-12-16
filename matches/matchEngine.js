const computeScore = require('../scores/computeScore.js')

module.exports = matchEngine

function matchEngine (users) {
  // Weights should multiply to 1 or less.
  const subScores = {
    // Match people of their gender preference.
    'gender': { transform: z => z, weight: 0.79, score: [] },
    // Match people of their age preference.
    // Allow leeway of 10 years beyond their min or max.
    'age': { transform: z => z, weight: 0.79, score: [], params: { T: 10 } },
    // Don't match someone they've dated already.
    'dated': { transform: z => !z, weight: 1, score: [] },
    // Match more with someone they've liked.
    'liked': { transform: z => z ? 1 : 0.5, weight: 2, score: [] },
    // Match less with someone they've nexted.
    'nexted': { transform: z => z ? 0.5 : 1, weight: 1, score: [] },
    // For prospects, the further away, the better.
    // Less chance of them being in the round.
    'location': { transform: z => (1-z), weight: 0.79, score: [] },
    // Don't show someone themself.
    'notself': { transform: z => z, weight: 1, score: [] },
  }
  // Key by id for `computeScore`.
  const people = []
  users.map(({ id, ...rest }) => people[id] = { id, ...rest })

  return computeScore(people, subScores)
}