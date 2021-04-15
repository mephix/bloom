const matchmaker = require('../matchmaker/matchmaker.js')

testMatchmaker()

function testMatchmaker() {
  var timer = null
  const setTimer = t => timer=t

  // Matches
  matches = { // global
    'amel.assioua@gmail.com': 99,
    'christine@bloom.com': 94,
    'anastasia@bloom.com': 92,
  }
  // Dates
  dates = [ // global
    {
      for: 'john.prins@gmail.com',
      with: 'christine@bloom.com',
    }
  ]

  matchmaker(setTimer)
}
