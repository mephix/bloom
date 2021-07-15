// delete test dates
const { db } = require('../apis/firestoreApi.js')

let testIds = [
  '4IizDnXG2WfJsAT8gbZUDVL78S42', // John
  '87d2hovnQ8ZTvZDVJaOeTFkREtL2', // Wren
  'iMONQXyIySUG8GsWfLEwhC2D9Nu2', // Lauren
  'Kfo4fhNY9bfLoFdIMdmXNPu7UB22', // Andy
  'M4u3UXCQENNHnLwnCurfseu6b5I2', // Dan
  'dMJ5PukVi9bY9pZGQLWGTDf1zQm2', // Justin
  // 'rENCRuRmF6gBxAQsS4E1qqna23L2', // Amel
]

deleteTestDates()

async function deleteTestDates() {
  let DATES = 'Dates-dev'
  let [queryFor, queryWith] = await Promise.all([
    db.collection(DATES).where('for', 'in', testIds).get(),
    db.collection(DATES).where('with', 'in', testIds).get(),
  ])
  let docs = [...queryFor.docs, ...queryWith.docs]
  console.log(`Found ${docs.length} matching dates.`)
  let result = await Promise.all(docs.map(d => {return db.collection(DATES).doc(d.id).delete()}))
  console.log(`Deleted ${result.length} dates`)
}