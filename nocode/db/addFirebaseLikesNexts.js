/*
 * Add Likes and Nexts from Firebase to people's profiles.
 */
// Parameter to change.
const today = '2021-06-09'
const dev = '' // '-dev'

// Get Adalo users.
const adaloUsersInputFile = `./nocode/output/Users ${today}.json`
const adaloUsersOutputFile = `./nocode/output/Users ${today} updated.json`
const fs = require('fs')
const fserr = err => {if (err) return console.log(err)}
let adaloUsers = JSON.parse(fs.readFileSync(adaloUsersInputFile, 'utf8'))

// Get Firebase users
const firestoreApi = require('../apis/firestoreApi.js')
const fireUsersFile = `./nocode/output/Users ${today} from firebase.json`
let fireUsers = JSON.parse(fs.readFileSync(fireUsersFile, 'utf8'))

// Match Firebase to Adalo ids.
let idMap = mapFirebaseToAdaloIds(adaloUsers, fireUsers)

// Add Likes and Nexts.
addLikesAndNexts()

async function addLikesAndNexts() {
    // Download Likes and Nexts.
    const likesQuery = await firestoreApi.db.collection('Likes' + dev).get()
    const nextsQuery = await firestoreApi.db.collection('Nexts' + dev).get()

    // Add each doc in Likes & Nexts to its Adalo user
    let addFire = name => doc => {
        let adaloUserMatches = adaloUsers.filter(a => a.id === idMap[doc.id])
        if (adaloUserMatches.length === 0) return
        let adaloUserMatch = adaloUserMatches[0]
        let fromFire = doc.data()[name.toLowerCase()].map(ref => idMap[ref.id]).filter(f => f !== undefined)
        let uniqueFromFire = [... new Set(fromFire)]
        let uniqueFromAdalo = [... new Set(adaloUserMatch[name])]
        console.log(`${adaloUserMatch.Email}: From ${uniqueFromAdalo.length} to ${uniqueFromAdalo.length + uniqueFromFire.length}`)
        adaloUserMatch[name] = [...uniqueFromFire, ...uniqueFromAdalo]
    }
    likesQuery.docs.map(addFire("Likes"))
    nextsQuery.docs.map(addFire("Nexts"))

    // Save updated Adalo user file.
    fs.writeFile(adaloUsersOutputFile, JSON.stringify(adaloUsers), fserr)
}

// Helper function.
// For each Firebase user, get their email, find the Adalo user with that email, and return the Adalo id.
function mapFirebaseToAdaloIds(adaloUsers, fireUsers) {
    let idMap = []
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
        }
    })
    return idMap 
}