// Helper function.
// For each Firebase user, get their email, find the Adalo user with that email, and return the Adalo id.
module.exports = function mapFirebaseToAdaloIds(adaloUsers, fireUsers) {
    let idMap = {}, idMapA2F = {}
    fireUsers.forEach(u => {
        let adaloMatches = adaloUsers.filter(a => a.Email === u.email)
        if (adaloMatches.length === 0) {
            console.warn(`No Adalo match found for user ${u.id} (${u.firstName})`)
        } else if (adaloMatches.length > 1) {
            console.warn(`Multiple Adalo matches found for user ${u.id} (${u.firstName}):`)
            adaloMatches.forEach(m => console.log(`${m.Email} (${m["First Name"]})`))
        } else {
            // Otherwise, if there is a unique match, add it
            let uniqueAdaloMatch = adaloMatches[0]
            idMap[u.id] = uniqueAdaloMatch.id
            idMapA2F[uniqueAdaloMatch.id] = u.id
        }
    })
    return { idMap, idMapA2F }
}