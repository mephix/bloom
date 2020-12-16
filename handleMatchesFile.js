const fs = require('fs')

exports.writeMatchesFile = writeMatchesFile
exports.readMatchesFile = readMatchesFile

function readMatchesFile(fileName) {
  const rows = fs.readFileSync(fileName, 'utf8').split('\n')
  let matches = []
  // Don't parse row 0 because it is a header row.
  for (let i=1; i<rows.length; i++) {
    // !! ADD THIS LINE because of blank lines in the Match file !!
    if (rows[i] === '') continue
    let [ email1, email2, scoreText, ...rest ] = rows[i].split(',')
    let score = Number(scoreText.split('\r',1))
    // Set the score.
    matches[email1]
      ? matches[email1][email2] = score
      : matches[email1] = { [email2]: score }
  }
  return matches
}

function writeMatchesFile(matchList, fileName) {
  const matchFileHeader = `email1,email2,score\n`

  // Sort by match score and keep only matches above a cutoff score.
  const CUTOFF = 0.1
  let matchFileContent = Object.keys(matchList).map(e => {
    const matchesM = Object.entries(matchList[e])
    const byScore = ([,score1],[,score2]) => (score2 - score1)
    const sortedMatchesM = matchesM.sort(byScore)
    const forPositiveScores = ([,score]) => (score > CUTOFF)
    const positiveMatchesM = sortedMatchesM.filter(forPositiveScores)
    const printedLineArray = positiveMatchesM.map(([email,score]) => `${e},${email},${score}`)
    return printedLineArray.join('\n')
  }).join('\n')

  // Output matches to file.
  const writeError = function (err) {if (err) {return console.log(err)}}
  fs.writeFile(fileName, matchFileHeader + matchFileContent, writeError)
  console.log(`Match file ${fileName} printed.`)
}
