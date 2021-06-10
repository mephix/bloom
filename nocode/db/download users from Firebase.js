// Parameter to update.
const today = '2021-06-09'
const dev = '' // '-dev'

// Other parameters.
const fs = require('fs')
const fserr = err => {if (err) return console.log(err)}
const fireUsersFile = `./nocode/output/Users ${today} from firebase.json`
const firestoreApi = require('../apis/firestoreApi.js')

getFireUsers()

async function getFireUsers() {
    const query = await firestoreApi.db.collection('Users' + dev).get()
    let fireUsers = query.docs.map(doc => { return { id: doc.id, ...doc.data() }})
    fs.writeFile(fireUsersFile, JSON.stringify(fireUsers), fserr)

} 
