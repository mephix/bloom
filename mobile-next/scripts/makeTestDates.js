// You can replace this with your own './firebase'
const { db } = require('./firestoreApi')
// in dailyApi.js line 3, replace:
// const { daily_api_key } = require('../DO_NOT_COMMIT.js')
// with:
// daily_api_key = process.env.DAILY_API_KEY
const daily = require('./dailyApi.js')
// This package is just used to give date IDs uniqueness.
const nanoid = require('nanoid')

async function main() {
  let query = await db.collection('Users-dev').where('here', '==', true).get()
  let usersHere = query.docs
  if (usersHere.length > 0) console.log(`${usersHere.length} people are Here.`)
  let userFor, userWith, nameFor, nameWith
  if (usersHere.length > 1) {
    userFor = usersHere[0]
    userWith = usersHere[1]
    nameFor = userFor.data().firstName
    nameWith = userWith.data().firstName
    console.log(`Creating a date for ${nameFor} with ${nameWith}`)
  } else {
    return console.log(`Not enough users here to make a date`)
  }
  let startTime = new Date()
  // copy startTime before calling 'setMinutes'.
  let endTime = new Date(startTime.toISOString())
  endTime = new Date(endTime.setMinutes((endTime.getMinutes() + 5) % 60))
  const nbf = daily.calcNbf({ startTime, preentry: 1 })
  const exp = daily.calcExp({ endTime })
  const {
    data: { url }
  } = await daily.makeRoom({ nbf, exp })
  // 'nanoid' is just used to make these date ids be unique despite being descriptive.
  const dateRef = db
    .collection('Dates-dev')
    .doc(`${startTime.toISOString()}_${nameFor}_${nameWith}_${nanoid.nanoid()}`)
  const date = {
    for: userFor.id,
    with: userWith.id,
    start: new Date(startTime),
    end: new Date(endTime),
    room: url,
    active: true,
    accepted: true
  }
  const batch = db.batch()
  batch.set(dateRef, date)
  // Now set both users' 'dateWith' field.
  batch.update(userFor.ref, { dateWith: userWith.id }, { merge: true })
  batch.update(userWith.ref, { dateWith: userFor.id }, { merge: true })
  // Commit
  let response = await batch.commit()
  console.log(
    `Test date successfully created at ${response[2].writeTime.toDate()}`
  )
}

main()
