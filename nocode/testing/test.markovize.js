const markovize = require('../posivibes/markovize.js')
const math = require('mathjs')

let a, am, success
a = math.matrix([[0, 1], [2, 3], [4, 5]])
am = markovize(a)
success = math.equal(am, math.matrix([[0, 1/9], [2/6, 3/9], [4/6, 5/9]]))
console.log(`markovize test passed: ${success.valueOf().every(i=>i.every(j=>j))}`)

a = math.matrix([[4, 5], [6, 3], [2, 5]])
am = markovize(a)
success = math.equal(am, math.matrix([[4/12, 5/13], [6/12, 3/13], [2/12, 5/13]]))
console.log(`markovize test passed: ${success.valueOf().every(i=>i.every(j=>j))}`)

