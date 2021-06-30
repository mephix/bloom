// Parameter to update.
const today = '2021-06-29'
const dev = '-dev' // '' // 

// Other parameters.
const fs = require('fs')
const fserr = err => {if (err) return console.log(err)}
const fireUsersFile = `./nocode/output/Users${dev} ${today} from firebase.json`
const firestoreApi = require('../apis/firestoreApi.js')

getFireUsers()

async function getFireUsers() {
    const query = await firestoreApi.db.collection('Users' + dev).get()
    let fireUsers = query.docs.map(doc => { return { id: doc.id, createTime: doc.createTime, ...doc.data() }})
    fireUsers.sort((u,v) => u.createTime.seconds-v.createTime.seconds).forEach(printFireUser)
    fs.writeFile(fireUsersFile, JSON.stringify(fireUsers), fserr)
    console.log(`Downloaded ${fireUsers.length} users from firebase`)
}

function printFireUser(u) {
    console.log(`[${u.createTime.toDate().toString()}]: ${u.firstName} (${u.gender}, ${u.age})`)
}
