const dateClock = {
  timeTilNextDateNight: (now, clockParams) => clockParams.timeTilNextDateNight,
  timeTilNextRound: (now, clockParams) => clockParams.timeTilNextRound,
  timeTilNextInterval: (now, clockParams) => clockParams.timeTilNextInterval,
  currentInterval: (now, clockParams) => clockParams.currentInterval,
}

export default dateClock
