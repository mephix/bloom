import { DateTime } from 'luxon'

const ROUND_MINUTES = process.env.REACT_APP_ROUND_MINUTES
  ? +process.env.REACT_APP_ROUND_MINUTES
  : 10

const INTERVAL_SECONDS = 4

export class DateClockService {
  static readonly maxActiveInterval = 99
  static readonly delay = 5

  static currentRoundStartEnd() {
    const now = DateTime.now()
    const { minute, second, millisecond } = now.toObject()
    if (!minute || !second || !millisecond) return
    const elapsedMillis =
      (minute % ROUND_MINUTES) * 60000 + second * 1000 + millisecond
    const remainingMillis = ROUND_MINUTES * 60000 - elapsedMillis
    const roundStartTime = now
      .minus(elapsedMillis)
      .toISO({ suppressMilliseconds: true, suppressSeconds: true })
    const roundEndTime = now
      .plus(remainingMillis)
      .toISO({ suppressMilliseconds: true, suppressSeconds: true })
    return { roundStartTime, roundEndTime }
  }

  static timeTilNextDateNight() {
    // ? How this code should work
    return 0
  }

  static timeTilNextRound() {
    const { minute, second, millisecond } = DateTime.now().toObject()
    if (!minute || !second || !millisecond) return Date.now()
    const remainingMinutes = ROUND_MINUTES - (minute % ROUND_MINUTES)
    const remainingTime = remainingMinutes * 60 - (second + millisecond / 1000)
    return remainingTime
  }

  static timeTilNextInterval() {
    const { second, millisecond } = DateTime.now().toObject()
    if (!second || !millisecond) return Date.now()
    const remainingSeconds = INTERVAL_SECONDS - (second % INTERVAL_SECONDS)
    const remainingTime = remainingSeconds - millisecond / 1000
    return remainingTime
  }

  static currentInterval() {
    const { minute, second, millisecond } = DateTime.now().toObject()
    if (!minute || !second || !millisecond) return Date.now()
    const elapsedMinutes = minute % ROUND_MINUTES
    const elapsedSeconds = elapsedMinutes * 60 + second + millisecond / 1000
    const elapsedIntervals = Math.ceil(elapsedSeconds / INTERVAL_SECONDS)
    return elapsedIntervals
  }
}
