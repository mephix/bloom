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
    const printedLineArray = Object.entries(score[id1]).map(([id2,score_id2]) => {
      const p1 = people[id1] //.profile
      const p2 = people[id2] //.profile
      return `\
        ${p1['First Name']},${p1['Email']},\
        ${p2['First Name']},${p2['Email']},\
        ${score_id2},\
        ${subScores['dated'].score?.[id1]?.[id2] ? 'dated' : ''},\
        ${subScores?.['liked']?.score?.[id1]?.[id2] ? 'liked' : ''},\
        ${subScores?.['nexted']?.score?.[id1]?.[id2] ? 'nexted' : ''},\
        ${p1['Gender']},${p2['Gender Preference']},\
        ${p2['Gender']},${p1['Gender Preference']},\
        ${subScores['gender'].score?.[id1]?.[id2] || 0},\
        ${p2['Age Preference Low']},${p1['Age']},${p2['Age Preference High']},\
        ${p1['Age Preference Low']},${p2['Age']},${p1['Age Preference High']},\
        ${subScores['age'].score?.[id1]?.[id2] || 0},\
        ${p1['Zipcode']},${p1['Radius']},\
        ${p2['Zipcode']},${p2['Radius']},\
        ${subScores['location'].score?.[id1]?.[id2] || 0},\
      `
    })
    return printedLineArray.join('\n')
  }).join('\n')

  // Output scores to file.
  const writeError = function (err) {if (err) {return console.log(err)}}
  fs.writeFile(fileName, scoreFileHeader + scoreFileContent, writeError)
  console.log(`Score file ${fileName} printed.`)
}
