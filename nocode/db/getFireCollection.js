const firestoreApi = require('../apis/firestoreApi.js')
const fs = require('fs')
const fserr = err => {if (err) return console.log(err)}
const consoleColorLog = require('../utils/consoleColorLog.js')

async function getFireCollection(collection, filename) {
  const query = await firestoreApi.db.collection(collection).get()
  let docs = query.docs.map(doc => { return { id: doc.id, createTime: doc.createTime, ...doc.data() }})
  docs = docs.filter(d => d.id !== "null")
  docs.sort((u,v) => v.createTime.seconds - u.createTime.seconds)
  fs.writeFile(filename, JSON.stringify(docs), fserr)
  consoleColorLog(`${collection}: ${docs.length} downloaded.`, 'green')
  return docs
}

module.exports = getFireCollection