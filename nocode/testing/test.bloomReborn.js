const adaloApi = require('../adaloApi.js')

getUsers()

async function getUsers() {
  const ids = [1]
  let responses = await Promise.all(ids.map(id =>
    adaloApi.get('Users', id)
  ))
  console.log(`Getting users ${ids}...found records for users with ids= ${responses.map(r=>r.id)}`)
}
async function addUsers() {
  let response = await adaloApi.create('Users', {
    'Email': 'nothing@bloom.com',
    'Password': 'nothing1',
    'First Name': 'Nothing',
    'Username': 'nothing',
  })
  console.log(`Adding new user...${response.statusText}`)
  return
}

async function listUsers(N=250) {
  let records = await adaloApi.list('Users', N)
  console.log(`${records.length} records found.`)
  return records
}
