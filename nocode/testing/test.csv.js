const { readCsv, writeToCsv } = require('../csv.js')

const testFile = './output/testData.csv'
let testData = [
  { 'name': 'Amel', 'posivibes': 4 },
  { 'name': 'John', 'posivibes': 3 },
]

// writeToCsv(testData, testFile)

let testDataRead = readCsv(testFile)
console.log(JSON.stringify(testDataRead))
