import { FirebaseService, PARAMETERS_COLLECTION } from '../firebaseService'
import * as dayjs from 'dayjs'

import * as CronParser from 'cron-parser'
export const DATE_NIGHT_SETTINGS = 'date_night_settings'

// const fromMillisToMinutes = (millis: number) => millis / 60 / 1000
const fromMinutesToMillis = (millis: number) => millis * 60 * 1000
// const fromSecondsToMillis = (millis: number) => millis * 1000

export class DateClockService {
  static dateNightDuration(maxRounds: number, roundMinutes: number) {
    return fromMinutesToMillis(maxRounds * roundMinutes)
  }

  static async getDateNightSettings() {
    const optionsDoc = await FirebaseService.db
      .collection(PARAMETERS_COLLECTION)
      .doc(DATE_NIGHT_SETTINGS)
      .get()
    const options = optionsDoc.data()
    const crontab = options?.cron_TEST
    const roundMinutes = options?.roundMinutes
    const maxRounds = options?.maxRounds
    // const maxActiveIntervals = options?.maxActiveIntervals
    // const intervalSeconds = options?.intervalSeconds
    // const acceptDateDelay = options?.acceptDateDelay

    return { crontab, roundMinutes, maxRounds }
  }

  static nextDateNight(
    crontab: string,
    dateNightDuration: number
  ) {
    const interval = CronParser.parseExpression(crontab)

    const prevDateNight = dayjs(interval.prev().toDate())
    const nextDateNight = dayjs(interval.next().toDate())

    // const dateNightDuration = this.dateNightDuration(maxRounds, roundMinutes)
    if (Math.abs(prevDateNight.diff(dayjs())) > dateNightDuration) {
      return { currentDateNight: false, nextDateNight }
    } else {
      return { currentDateNight: true, nextDateNight: prevDateNight }
    }
  }

  static timeTilNextDateNight(
    crontab: string,
    dateNightDuration: number,
    nextDateNight: dayjs.Dayjs,
    currentDateNight: boolean
  ) {
    if (!nextDateNight) return 0
    const timeTil = nextDateNight.diff(dayjs())
    if (Math.abs(timeTil) < dateNightDuration && currentDateNight) return 0
    else if (timeTil < 0 && currentDateNight) {
      const interval = CronParser.parseExpression(crontab)
      const nextDateNight = dayjs(interval.next().toDate())
      return nextDateNight.diff(dayjs())
    }
    return timeTil
  }

  static timeTilDateNightEnd(
    nextDateNight: dayjs.Dayjs,
    dateNightDuration: number
  ) {
    const dateNightEnd = nextDateNight.add(dateNightDuration, 'milliseconds')
    return Math.abs(dateNightEnd.diff(dayjs()))
  }

  static async getDateNightData() {
    const { crontab, roundMinutes, maxRounds } =
      await this.getDateNightSettings()
    const dateNightDuration = this.dateNightDuration(maxRounds, roundMinutes)
    const { currentDateNight, nextDateNight } = this.nextDateNight(
      crontab,
      dateNightDuration
    )
    const timeTilNextDateNight = this.timeTilNextDateNight(
      crontab,
      dateNightDuration,
      nextDateNight,
      currentDateNight
    )
    const timeTilDateNightEnd = this.timeTilDateNightEnd(
      nextDateNight,
      dateNightDuration
    )

    return {
      currentDateNight,
      timeTilNextDateNight,
      timeTilDateNightEnd
    }
  }

  static async currentRoundStartEnd() {
    const { crontab, roundMinutes, maxRounds } =
      await this.getDateNightSettings()
    const dateNightDuration = this.dateNightDuration(maxRounds, roundMinutes)
    const { currentDateNight, nextDateNight } = this.nextDateNight(
      crontab,
      dateNightDuration
    )
    const timeTilNextDateNight = this.timeTilNextDateNight(
      crontab,
      dateNightDuration,
      nextDateNight,
      currentDateNight
    )

    if (timeTilNextDateNight > 0) {
      const roundStartTime = nextDateNight
      const roundEndTime = roundStartTime.add(roundMinutes, 'minutes')
      return {
        roundStartTime: roundStartTime.toISOString(),
        roundEndTime: roundEndTime.toISOString()
      }
    }
    const passedFromStartDateNight = dayjs().diff(nextDateNight)
    const roundsPassed = Math.floor(
      passedFromStartDateNight / fromMinutesToMillis(roundMinutes)
    )
    const roundStartTime = nextDateNight.add(
      roundMinutes * roundsPassed,
      'minutes'
    )
    const roundEndTime = roundStartTime.add(roundMinutes, 'minutes')
    return {
      roundStartTime: roundStartTime.toISOString(),
      roundEndTime: roundEndTime.toISOString()
    }
  }
}
