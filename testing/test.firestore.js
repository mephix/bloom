const getDb = require('../apis/firestoreApi.js')

testGetDb()

async function testGetDb() {
  let db = getDb()
  return db
}
