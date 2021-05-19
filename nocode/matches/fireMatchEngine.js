const computeScore = require('../scores/computeScore.js')

module.exports = fireMatchEngine

function fireMatchEngine (users) {
  // Weights reflect the overall match probability implied by the signals.
  // The weaker the signals, the less they move the probability from the
  // base rate (which is low). The weight on `notself`, the most basic
  // of signals, acts like an overall signal weight.
  const subScores = {
    // Match people of their gender preference.
    'gender': { transform: z => z, weight: 1, score: [] },
    // Match people of their age preference.
    // Allow leeway of 10 years beyond their min or max.
    'age': { transform: z => z, weight: 1, score: [], params: { T: 10 } },
    // Don't match someone they've dated already.
    'dated': { transform: z => !z, weight: 1, score: [] },
    // Match more with someone they've liked.
    'both_liked': { transform: z => z ? 1 : 0.5, weight: 1, score: [] },
    // Don't match if either person nexted.
    'either_nexted': { transform: z => z ? 0 : 1, weight: 1, score: [] },
    // For matches, the closer, the better.
    'location': { transform: z => z, weight: 1, score: [] },
    // Don't show someone themself.
    'notself': { transform: z => z, weight: 100, score: [] },
  }
  // Key by id for `computeScore`.
  const people = []
  users.map(({ id, ...rest }) => people[id] = { id, ...rest })

  return computeScore(people, subScores)
}