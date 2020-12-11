const USERS_STORED_LOCALLY = './csvs/Users (tmp).json'
const USERS_FROM_CSV = './csvs/Users 1644 (csv to json).json'
const USERS_MERGED = './csvs/Users 1644 (ids added).json'

const fs = require('fs')
const errf = err => {if (err) return console.log(err)}

let users_csv = JSON.parse(fs.readFileSync(USERS_FROM_CSV, 'utf8'))
let users_tmp = JSON.parse(fs.readFileSync(USERS_STORED_LOCALLY, 'utf8'))
users_csv.forEach((u_csv,i) => {
  users_tmp.forEach(u_tmp => {
    if (u_csv.Email !== u_tmp.Email) return
    else {
      users_csv[i].id = u_tmp.id
    }
  })
})
for (let i=users_csv.length-1; i>=0; i--) {
  if (!users_csv[i].id) {
    users_csv[i].id = users_csv[i+1].id + 1
  }
}

const usersCsvById = []
users_csv.map(({ id, ...rest }) => usersCsvById[id] = rest)
const usersTmpById = []
users_tmp.map(({ id, ...rest }) => usersTmpById[id] = rest)

// compare the two, users_tmp and users_csv
Object.keys(usersCsvById).map(id => {
  if (usersTmpById[id]) {
    if (usersCsvById[id].Email === usersTmpById[id].Email) {

    } else {
      console.log(`${usersCsvById[id].Email} (${id}) has users_tmp email of ${usersTmpById[id].Email}]`)
    }
  } else {
    console.log(`${usersCsvById[id].Email} (${id}) HAS NO MATCH`)
  }
})

fs.writeFile(USERS_MERGED, JSON.stringify(users_csv), errf)
console.log(`Ids added to users.`)
