const fs = require('fs')
const runMatchEngine = require('../runMatchEngine.js')

const NUMBER_OF_TOP_MATCHES = 3
const MATCHES_FILE = './csvs/Matches (all positive).csv'
testRunMatchEngine()

async function testRunMatchEngine() {
  let matchList = await runMatchEngine()
  let matches = Object.keys(matchList).map(e => {
    const matches = Object.entries(matchList[e])
    const sortedMatches = matches.sort(([email1,score1],[email2,score2]) => {
      return score2 - score1
    })
    // const topMatches = sortedMatches.slice(0, NUMBER_OF_TOP_MATCHES)
    // Instead of top matches, print all matches with positive score.
    const topMatches = sortedMatches.filter(([email1,score1]) => score1>0)
    return topMatches.map(([email,score]) => `${e},${email},${score}`).join('\n')
  })

  // Output matches to file
  const matchFileContent = `email1,email2,score\n` + matches.join('\n')
  fs.writeFile(MATCHES_FILE, matchFileContent, function (err) {
    if (err) {
      return console.log(err)
    }})
  console.log(`Match file ${MATCHES_FILE} printed.`)
}