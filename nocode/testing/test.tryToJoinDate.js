// import tryToJoinDate from '../matchmaker/tryToJoinDate.js'
// const matchmaker = require('../matchmaker/matchmaker.js')
const tryToJoinDate = require('../matchmaker/tryToJoinDate.js')
// const monkey = require('../matchmaker/test.tmpDelete.js')
const firestore = require('../apis/firestoreApi.js')

let dateId = '0L8SjnhEoqRGIENNyf5M'
testTryToJoinDate(dateId)

async function testTryToJoinDate() {
    await tryToJoinDate(dateId)
}
