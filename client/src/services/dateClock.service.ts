import { DateTime, Duration } from 'luxon'
import { db, PARAMETERS_COLLECTION } from '../firebase'
import CronParser from 'cron-parser'
import { Logger } from './utils/Logger'

// const ROUND_MINUTES = process.env.REACT_APP_ROUND_MINUTES
//   ? +process.env.REACT_APP_ROUND_MINUTES
//   : 10

// const INTERVAL_SECONDS = 4
const ISO_OPTIONS = { suppressMilliseconds: true, suppressSeconds: true }

const logger = new Logger('DateClock', '#8708d1')

const DATE_NIGHT_SETTINGS = 'date_night_settings'

const fromMillisToMinutes = (millis: number) => millis / 60 / 1000
const fromMinutesToMillis = (millis: number) => millis * 60 * 1000

export class DateClockService {
  private static maxRounds = 1
  private static roundInterval = 10
  private static nextDateNight: DateTime | null = null

  static get dateNightDuration() {
    return Duration.fromMillis(
      fromMinutesToMillis(this.maxRounds * this.roundInterval)
    )
  }

  static async initNextDateNight() {
    try {
      const optionsDoc = await db
        .collection(PARAMETERS_COLLECTION)
        .doc(DATE_NIGHT_SETTINGS)
        .get()
      const options = optionsDoc.data()
      const crontab = options?.cron
      const roundInterval = options?.roundInterval
      const maxRounds = options?.maxRounds
      logger.debug('crontab', `'${crontab}'`)
      logger.debug('roundInterval', roundInterval)
      logger.debug('maxActiveIntervals', maxRounds)
      if (!crontab)
        throw new Error('Crontab instruction not defined in database!')
      if (!roundInterval || typeof roundInterval !== 'number')
        throw new Error(
          'roundInterval is not defined in database or the value is invalid!'
        )
      if (!maxRounds || typeof maxRounds !== 'number')
        throw new Error(
          'maxRounds is not defined in database or the value is invalid!'
        )
      this.roundInterval = roundInterval
      this.maxRounds = maxRounds
      logger.debug(
        'Date Night Duration:',
        fromMillisToMinutes(this.dateNightDuration.milliseconds)
      )
      const interval = CronParser.parseExpression(crontab)

      const prevDateNight = DateTime.fromJSDate(interval.prev().toDate())
      const nextDateNight = DateTime.fromJSDate(interval.next().toDate())

      if (
        Math.abs(prevDateNight.diffNow().toMillis()) >
        this.dateNightDuration.toMillis()
      )
        this.nextDateNight = nextDateNight
      else this.nextDateNight = prevDateNight
      logger.debug(
        'Minutes untill next date night',
        Math.ceil(fromMillisToMinutes(this.timeTilNextDateNight()))
      )
      logger.debug(
        'Minutes until next round',
        Math.ceil(fromMillisToMinutes(this.timeTilNextRound()))
      )
      logger.debug('currentRoundStartEnd', this.currentRoundStartEnd())
    } catch (err) {
      logger.error(err.message)
      throw new Error('Error while parsing database settings!')
    }
  }

  static currentRoundStartEnd(): {
    roundStartTime: string
    roundEndTime: string
  } {
    if (!this.nextDateNight) {
      const now = DateTime.now()
      return {
        roundStartTime: now.toISO(ISO_OPTIONS),
        roundEndTime: now
          .plus({ minutes: this.roundInterval })
          .toISO(ISO_OPTIONS)
      }
    }
    if (this.timeTilNextDateNight() > 0) {
      const roundStartTime = this.nextDateNight
      const roundEndTime = roundStartTime.plus({ minutes: this.roundInterval })
      return {
        roundStartTime: roundStartTime.toISO(ISO_OPTIONS),
        roundEndTime: roundEndTime.toISO(ISO_OPTIONS)
      }
    }
    const passedFromStartDateNight = Math.abs(
      this.nextDateNight.diffNow().milliseconds
    )
    const roundsPassed = Math.floor(
      passedFromStartDateNight / fromMinutesToMillis(this.roundInterval)
    )
    const roundStartTime = this.nextDateNight.plus({
      minutes: this.roundInterval * roundsPassed
    })
    const roundEndTime = roundStartTime.plus({ minutes: this.roundInterval })
    return {
      roundStartTime: roundStartTime.toISO(ISO_OPTIONS),
      roundEndTime: roundEndTime.toISO(ISO_OPTIONS)
    }
  }

  static timeTilNextDateNight() {
    if (!this.nextDateNight) return 0
    const timeTil = this.nextDateNight.diffNow()
    if (timeTil.milliseconds <= 0) return 0
    return timeTil.milliseconds
  }

  static timeTilNextRound() {
    if (this.timeTilNextDateNight() > 0 || !this.nextDateNight)
      return this.timeTilNextDateNight()
    const timePassed = Math.abs(this.nextDateNight.diffNow().milliseconds)
    const roundIntevalMilis = fromMinutesToMillis(this.roundInterval)
    const remainingTime = roundIntevalMilis - (timePassed % roundIntevalMilis)
    return remainingTime
  }

  // static timeTilNextInterval() {
  //   const { second, millisecond } = DateTime.now().toObject()
  //   if (!second || !millisecond) return Date.now()
  //   const remainingSeconds = INTERVAL_SECONDS - (second % INTERVAL_SECONDS)
  //   const remainingTime = remainingSeconds - millisecond / 1000
  //   return remainingTime
  // }

  // static currentInterval() {
  //   const { minute, second, millisecond } = DateTime.now().toObject()
  //   if (!minute || !second || !millisecond) return Date.now()
  //   const elapsedMinutes = minute % ROUND_MINUTES
  //   const elapsedSeconds = elapsedMinutes * 60 + second + millisecond / 1000
  //   const elapsedIntervals = Math.ceil(elapsedSeconds / INTERVAL_SECONDS)
  //   return elapsedIntervals
  // }
}
