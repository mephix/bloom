
module.exports = applyToScores

// Apply a function like floor or multiply to scores. 
// fn = Math.floor
// fn = x => x*100
function applyToScores(score, fn) {
    let modifiedScore = {}
    Object.keys(score).map(id1 => {
        modifiedScore[id1] = {}
        Object.keys(score[id1]).map(id2 => {
            modifiedScore[id1][id2] = fn(score[id1][id2])
        })
    })
    return modifiedScore
}