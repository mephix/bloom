const computeScore = require('../scores/computeScore.js')

module.exports = posivibesEngine

function posivibesEngine(users) {
  // Weights should multiply to 1 or less.
  const subScores = {
    // Give posivibes to people they've hearted.
    'hearted': { transform: z => z, weight: 1, score: [] },
    // Give posivibes to people they've liked.
    'liked': { transform: z => z, weight: 1, score: [] },
    // Don't show someone themself.
    'notself': { transform: z => z, weight: 1, score: [] },
  }
  // Key by id for `computeScore`.
  const people = []
  users.map(({ id, ...rest }) => people[id] = { id, ...rest })

  return computeScore(people, subScores)
}

