import { DateTime, Duration } from 'luxon'
import { db, PARAMETERS_COLLECTION } from '../firebase'
import CronParser from 'cron-parser'
import { Logger } from '../utils'

const ISO_OPTIONS = { suppressMilliseconds: true, suppressSeconds: true }

const logger = new Logger('DateClock', '#8708d1')

const DATE_NIGHT_SETTINGS = 'date_night_settings'

export const fromMillisToMinutes = (millis: number) => millis / 60 / 1000
export const fromMinutesToMillis = (millis: number) => millis * 60 * 1000
export const fromSecondsToMillis = (millis: number) => millis * 1000

export class DateClockService {
  private static maxRounds = 1
  private static roundMinutes = 10
  private static intervalSeconds = 10
  private static nextDateNight: DateTime | null = null
  private static crontab = ''
  private static isPrevDateNight = false
  public static maxActiveIntervals = 10
  public static acceptDateDelay = 0

  private static get passedFromRoundStart() {
    const { roundStartTime: roundStartTimeString } = this.currentRoundStartEnd()
    const roundStartTime = DateTime.fromISO(roundStartTimeString)
    return Math.abs(roundStartTime.diffNow().milliseconds)
  }

  static get dateNightDuration() {
    return Duration.fromMillis(
      fromMinutesToMillis(this.maxRounds * this.roundMinutes)
    )
  }

  static get isCurrentDateNight() {
    if (this.timeTilNextDateNight() === 0) return true
    else return false
  }

  static get isExpired() {
    if (!this.nextDateNight) return true
    const timeTil = this.nextDateNight.diffNow()
    if (timeTil.milliseconds < 0) return true
    return false
  }
  static get currentInterval() {
    const currentInterval =
      this.passedFromRoundStart / fromSecondsToMillis(this.intervalSeconds)
    return Math.floor(currentInterval)
  }

  static get intervalMillis() {
    return fromSecondsToMillis(this.intervalSeconds)
  }

  static async initNextDateNight() {
    try {
      const optionsDoc = await db
        .collection(PARAMETERS_COLLECTION)
        .doc(DATE_NIGHT_SETTINGS)
        .get()
      const options = optionsDoc.data()
      const crontab = options?.cron
      const roundMinutes = options?.roundMinutes
      const maxRounds = options?.maxRounds
      const maxActiveIntervals = options?.maxActiveIntervals
      const intervalSeconds = options?.intervalSeconds
      const acceptDateDelay = options?.acceptDateDelay

      logger.debug('crontab', `'${crontab}'`)
      logger.debug('roundMinutes', roundMinutes)
      logger.debug('maxRounds', maxRounds)
      if (!crontab)
        throw new Error('Crontab instruction not defined in database!')
      if (!roundMinutes || typeof roundMinutes !== 'number')
        throw new Error(
          'roundMinutes is not defined in database or the value is invalid!'
        )
      if (!maxRounds || typeof maxRounds !== 'number')
        throw new Error(
          'maxRounds is not defined in database or the value is invalid!'
        )
      if (!maxActiveIntervals || typeof maxActiveIntervals !== 'number')
        throw new Error(
          'maxActiveIntervals is not defined in database or the value is invalid!'
        )
      if (!intervalSeconds || typeof intervalSeconds !== 'number')
        throw new Error(
          'intervalSeconds is not defined in database or the value is invalid!'
        )
      if (!acceptDateDelay || typeof acceptDateDelay !== 'number')
        throw new Error(
          'acceptDateDelay is not defined in database or the value is invalid!'
        )
      this.crontab = crontab
      this.roundMinutes = roundMinutes
      this.maxRounds = maxRounds
      this.maxActiveIntervals = maxActiveIntervals
      this.intervalSeconds = intervalSeconds
      this.acceptDateDelay = acceptDateDelay
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
      ) {
        logger.debug('set next Date Night')
        this.isPrevDateNight = false
        this.nextDateNight = nextDateNight
      } else {
        logger.debug('set prev Date Night')
        this.isPrevDateNight = true
        this.nextDateNight = prevDateNight
      }
      logger.debug(
        'Minutes untill next date night',
        Math.ceil(fromMillisToMinutes(this.timeTilNextDateNight()))
      )
      logger.debug(
        'Minutes until next round',
        Math.ceil(fromMillisToMinutes(this.timeTilNextRound()))
      )
      logger.debug('isCurrentDateNight', this.isCurrentDateNight)
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
          .plus({ minutes: this.roundMinutes })
          .toISO(ISO_OPTIONS)
      }
    }
    if (this.timeTilNextDateNight() > 0) {
      const roundStartTime = this.nextDateNight
      const roundEndTime = roundStartTime.plus({ minutes: this.roundMinutes })
      return {
        roundStartTime: roundStartTime.toISO(ISO_OPTIONS),
        roundEndTime: roundEndTime.toISO(ISO_OPTIONS)
      }
    }
    const passedFromStartDateNight = Math.abs(
      this.nextDateNight.diffNow().milliseconds
    )
    const roundsPassed = Math.floor(
      passedFromStartDateNight / fromMinutesToMillis(this.roundMinutes)
    )
    const roundStartTime = this.nextDateNight.plus({
      minutes: this.roundMinutes * roundsPassed
    })
    const roundEndTime = roundStartTime.plus({ minutes: this.roundMinutes })
    return {
      roundStartTime: roundStartTime.toISO(ISO_OPTIONS),
      roundEndTime: roundEndTime.toISO(ISO_OPTIONS)
    }
  }

  static timeTilNextDateNight() {
    if (!this.nextDateNight) return 0
    const timeTil = this.nextDateNight.diffNow()
    // logger.debug('timeTil', timeTil.milliseconds)
    if (
      Math.abs(timeTil.milliseconds) < this.dateNightDuration.milliseconds &&
      this.isPrevDateNight
    )
      return 0
    else if (timeTil.milliseconds < 0 && this.isPrevDateNight) {
      const interval = CronParser.parseExpression(this.crontab)
      const nextDateNight = DateTime.fromJSDate(interval.next().toDate())
      return nextDateNight.diffNow().milliseconds
    }
    return timeTil.milliseconds
    // if (!this.nextDateNight) return 0
    // const timeTil = this.nextDateNight.diffNow()
    // console.log(timeTil)
    // if (timeTil.milliseconds <= 0) return 0
    // return timeTil.milliseconds
  }

  static timeTilNextRound() {
    if (this.timeTilNextDateNight() > 0 || !this.nextDateNight)
      return this.timeTilNextDateNight()
    const timePassed = Math.abs(this.nextDateNight.diffNow().milliseconds)
    const roundDurationMillis = fromMinutesToMillis(this.roundMinutes)
    const remainingTime =
      roundDurationMillis - (timePassed % roundDurationMillis)
    return remainingTime
  }

  static timeTilNextInterval() {
    // const { second, millisecond } = DateTime.now().toObject()
    // if (!second || !millisecond) return Date.now()
    // const remainingSeconds = INTERVAL_SECONDS - (second % INTERVAL_SECONDS)
    // const remainingTime = remainingSeconds - millisecond / 1000
    // return remainingTime
    if (this.timeTilNextDateNight() > 0) return this.timeTilNextDateNight()
    const intervalDurationMillis = fromSecondsToMillis(this.intervalSeconds)
    const remainingTime =
      intervalDurationMillis -
      (this.passedFromRoundStart % intervalDurationMillis)
    return remainingTime
  }

  // static currentInterval() {
  //   const { minute, second, millisecond } = DateTime.now().toObject()
  //   if (!minute || !second || !millisecond) return Date.now()
  //   const elapsedMinutes = minute % ROUND_MINUTES
  //   const elapsedSeconds = elapsedMinutes * 60 + second + millisecond / 1000
  //   const elapsedIntervals = Math.ceil(elapsedSeconds / INTERVAL_SECONDS)
  //   return elapsedIntervals
  // }
}
