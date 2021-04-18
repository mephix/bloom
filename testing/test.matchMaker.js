const matchmaker = require('../matchmaker/matchmaker.js')

testMatchmaker()

async function testMatchmaker() {
  var timer = null
  const setTimer = t => timer=t

  userId = 'john.prins@gmail.com'

  // Matches (global variable)
  matches = {
    'john.prins@gmail.com': {
      score: 99,
      invited: false,
    },
    // 'amel.assioua@gmail.com': {
    //   score: 99,
    //   invited: false,
    // },
    // 'christine@bloom.com': {
    //   score: 97,
    //   invited: false,
    // },
    // 'anastasia@bloom.com': {
    //   score: 95,
    //   invited: false,
    // },
  }
  // Dates (global variable)
  dates = []
    // [
    //   {
    //     for: 'john.prins@gmail.com',
    //     with: 'christine@bloom.com',
    //   }
    // ]

  matchmaker(setTimer)
}
