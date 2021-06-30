// delete test dates
const { db } = require('../apis/firestoreApi.js')

let FOR_OR_WITH = 'with'

let testIds = [
  'rENCRuRmF6gBxAQsS4E1qqna23L2', // Amel
  '4IizDnXG2WfJsAT8gbZUDVL78S42', // John
  '87d2hovnQ8ZTvZDVJaOeTFkREtL2', // Wren
  'iMONQXyIySUG8GsWfLEwhC2D9Nu2', // Lauren
  'Kfo4fhNY9bfLoFdIMdmXNPu7UB22', // Andy
  'M4u3UXCQENNHnLwnCurfseu6b5I2', // Dan
  'dMJ5PukVi9bY9pZGQLWGTDf1zQm2', // Justin
]

deleteTestDates()

async function deleteTestDates() {
  let DATES = 'Dates-dev'
  let query = await db.collection(DATES)
      .where(FOR_OR_WITH, 'in', testIds)
      .get()
  console.log(`Found ${query.docs.length} matching dates.`)
  let result = await Promise.all(query.docs.map(d => {return db.collection(DATES).doc(d.id).delete()}))
  console.log(`Deleted ${result.length} dates`)
}