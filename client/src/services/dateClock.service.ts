import { DateTime } from 'luxon'

const ROUND_MINUTES = process.env.REACT_APP_ROUND_MINUTES
  ? +process.env.REACT_APP_ROUND_MINUTES
  : 10

export class DateClockService {
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
}
