
const delay = 10
const user = { here: true, free: true }
// Parameters to stub `dateClock` with
const clockParams = {
  roundLength: 5*60,
  maxActiveInterval: 99,
  timeTilNextDateNight: 0,
  timeTilNextRound: 1000 * 2.5,
  timeTilNextInterval: 1000 * 3.5,
  currentInterval: 50,
}
// Make params object because it gets passed to setTimeout
const params = { user, delay, clockParams }

export default params