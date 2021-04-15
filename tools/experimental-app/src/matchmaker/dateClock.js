var { DateTime } = require('luxon');

const roundLength = 5*60
const intervalLength = 5

function timeTilNextRound() {
  const now = DateTime.now()
  const { year, month, day, hour, minute, second, millisecond} = now.toObject()
  const nextRoundStartObj = {
    year, month, day, 
  }
}

const dateClock = {
  timeTilNextDateNight: (now) => 0,
  timeTilNextRound,
  timeTilNextInterval: (now) => 5,
  currentInterval: (now) => 50,
  maxActiveInterval: () => 99,
  delay: () => 10,
}

export default dateClock
