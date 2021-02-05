const computeScore = require('../scores/computeScore.js')

module.exports = matchEngine

function matchEngine (users) {
  // Weights reflect the overall match probability implied by the signals.
  // The weaker the signals, the less they move the probability from the
  // base rate (which is low). The low weight on `notself`, the most basic
  // of signals, acts like an overall signal strength downweight.
  const subScores = {
    // Match people of their gender preference.
    'gender': { transform: z => z, weight: 1, score: [] },
    // Match people of their age preference.
    // Allow leeway of 10 years beyond their min or max.
    'age': { transform: z => z, weight: 0.75, score: [], params: { T: 10 } },
    // Don't match someone they've dated already.
    'dated': { transform: z => !z, weight: 1, score: [] },
    // Match more with someone they've liked.
    'liked': { transform: z => z ? 1 : 0.5, weight: 1, score: [] },
    // Match less with someone they've nexted.
    'nexted': { transform: z => z ? 0.5 : 1, weight: 1, score: [] },
    // For matches, the closer, the better.
    'location': { transform: z => z, weight: 0.75, score: [] },
    // Don't show someone themself.
    'notself': { transform: z => z, weight: 0.2, score: [] },
  }
  // Key by id for `computeScore`.
  const people = []
  users.map(({ id, ...rest }) => people[id] = { id, ...rest })

  return computeScore(people, subScores)
}