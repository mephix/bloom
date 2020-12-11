
module.exports = removeProspects

function removeProspects({ prospects, people, relationship }) {
  let relationship = []
  Object.keys(prospects).map( pid => {
    relationship[pid] = []
    Object.keys(prospects[pid]).map( qid => {
      if (people[pid][relationship].includes(qid)) {
        prospects[pid][qid] = 0
        relationship[pid][qid] = true
      }
    })
  })
  return { prospects, relationship }
}