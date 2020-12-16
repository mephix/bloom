const fs = require('fs')

module.exports = writeScoresToFile

function writeScoresToFile({ people, score, subScores, fileName }) {
  // Print gender next to the other's gender preference
  // Print age between the other's age preferences
  const scoreFileHeader = `\
    name1,email1,name2,email2,\
    score,dated,liked,nexted,\
    gender1,genderpref2,gender2,genderpref1,gender score,\
    agelo2,age1,agehi2,agelo1,age2,agehi1,age score,\
    zip1,radius1,zip2,radius2,location score,\
  \n`

  let scoreFileContent = Object.keys(score).map(id1 => {
    const printedLineArray = Object.entries(score[id1]).map(([id2,score_id2]) => `\
      ${people[id1].name},${people[id1].email},\
      ${people[id2].name},${people[id2].email},\
      ${score_id2},\
      ${subScores['dated'].score?.[id1]?.[id2] ? 'dated' : ''},\
      ${subScores['liked'].score?.[id1]?.[id2] ? 'liked' : ''},\
      ${subScores['nexted'].score?.[id1]?.[id2] ? 'nexted' : ''},\
      ${people[id1].gender},${people[id2].genderPreference},\
      ${people[id2].gender},${people[id1].genderPreference},\
      ${subScores['gender'].score?.[id1]?.[id2] || 0},\
      ${people[id2].agePreferenceLo},${people[id1].age},${people[id2].agePreferenceHi},\
      ${people[id1].agePreferenceLo},${people[id2].age},${people[id1].agePreferenceHi},\
      ${subScores['age'].score?.[id1]?.[id2] || 0},\
      ${people[id1].zip},${people[id1].radius},\
      ${people[id2].zip},${people[id2].radius},\
      ${subScores['location'].score?.[id1]?.[id2] || 0},\
    `)
    return printedLineArray.join('\n')
  }).join('\n')

  // Output scores to file.
  const writeError = function (err) {if (err) {return console.log(err)}}
  fs.writeFile(fileName, scoreFileHeader + scoreFileContent, writeError)
  console.log(`Score file ${fileName} printed.`)
}
