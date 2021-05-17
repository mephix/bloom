const tryToJoinDate = require('../matchmaker/tryToJoinDate.js')
const firestore = require('../apis/firestoreApi.js')
const db = firestore.db

testTryToJoinDate()

async function testTryToJoinDate() {
    const batch = db.batch()
    batch.update(db.collection('Dates').doc('iHUZv6SWtRGWtSFLkIHK'), { active: true, accepted: null })
    batch.update(db.collection('Dates').doc('gesAc2QQ5FX3R1Wd0miA'), { active: true, accepted: null })
    batch.update(db.collection('Dates').doc('fhRntWNybEQRgwFZ8thB'), { active: true, accepted: null })
    batch.update(db.collection('Dates').doc('SnluiFmrpnwG8rvOEuG2'), { active: true, accepted: null })
    batch.update(db.collection('Dates').doc('QY3343yj4JvdKkhzBXnx'), { active: true, accepted: null })
    await batch.commit()
    await tryToJoinDate('fhRntWNybEQRgwFZ8thB')
    console.log('')
}
