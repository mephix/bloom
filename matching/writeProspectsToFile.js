module.exports = writeProspectsToFile

function writeProspectsToFile({ people, prospectsByPreference, prospects, dated, liked, nexted }, fileName) {
  const prospectFileHeader = `name1,email1,name2,email2,score,preference score,dated,liked,nexted,gender1,genderpref2,gender2,genderpref1,agelo2,age1,agehi2,agelo1,age2,agehi1,location1,radius1,location2,radius2\n`

  // Sort by prospect score and keep only prospects above a cutoff score.
  const CUTOFF = 0.1
  let prospectFileContent = Object.keys(prospects).map(id1 => {
    const prospectsM = Object.entries(prospects[id1])
    const byScore = ([,score1],[,score2]) => (score2 - score1)
    const sortedMatchesM = prospectsM.sort(byScore)
    const forPositiveScores = ([,score]) => (score > CUTOFF)
    const positiveMatchesM = sortedMatchesM.filter(forPositiveScores)
    // Print gender next to the other's gender preference
    // Print age between the other's age preferences
    const printedLineArray = positiveMatchesM.map(([id2,score]) => `
      ${people[id1].name},${people[id2].name},
      ${people[id1].email},${people[id2].email},
      ${score},${prospectsByPreference[id1][id2]},
      ${dated[id1][id2] ? 'dated' : ''},
      ${liked[id1][id2] ? 'liked' : ''},
      ${nexted[id1][id2] ? 'nexted' : ''},
      ${people[id1].gender},${people[id2].genderPreference},
      ${people[id2].gender},${people[id1].genderPreference},
      ${people[id2].agePreferenceLo},${people[id1].age},${people[id2].agePreferenceHi},
      ${people[id1].agePreferenceLo},${people[id2].age},${people[id1].agePreferenceHi},
      ${people[id1].location},${people[id1].radius},
      ${people[id2].location},${people[id2].radius},
    `)
    return printedLineArray.join('\n')
  }).join('\n')

  // Output prospects to file.
  const writeError = function (err) {if (err) {return console.log(err)}}
  fs.writeFile(fileName, prospectFileHeader + prospectFileContent, writeError)
  console.log(`Prospect file ${fileName} printed.`)
}
