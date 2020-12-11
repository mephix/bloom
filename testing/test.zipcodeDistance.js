const { zipcodeDistance, loadZipLatlons } = require('../zipcodeDistance.js')
const zipLatLons = loadZipLatlons()

let z1 = 94117
let z2 = 94118

let d = zipcodeDistance(z1, z2, zipLatLons)
console.log(`The distance between ${z1} and ${z2} is ${Math.round(d/1600)} miles`)
