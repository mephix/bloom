const { DateTime } = require('luxon')
const { db, time } = require('./firebase')
const DATES_COLLECTION = 'Dates-dev'

const users = ['9Z3PHTpJWOhxi2YAnpapP3hHL652', 'sltYAEsWs8hHIS3M208foDWMoQm2']

const DURATION_MIN = 10

async function createDate() {
  const [first, second] = users
  const start = DateTime.now().minus({ minutes: 1 })
  const end = start.plus({ minutes: DURATION_MIN })
  await db.collection(DATES_COLLECTION).add({
    with: first,
    for: second,
    start: time.fromDate(start.toJSDate()),
    end: time.fromDate(end.toJSDate()),
    active: true,
    accepted: true
  })
  console.log('finish')
  process.exit(0)
}
createDate()
