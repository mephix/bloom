import meetup from '../state/meetup'
import { DateClockService, fromMillisToMinutes } from './dateClock.service'
import { Logger } from '../utils'
import { MatchesService } from './matches.service'
import user from '../state/user'

const logger = new Logger('Matchmaker', '#005aeb')

export class Matchmaker {
  static timeout: NodeJS.Timeout | null = null

  static async initialize() {
    logger.log('Initialization')
    if (!user.email) throw new Error('No user defined!')
    await DateClockService.initNextDateNight()
    MatchesService.setEmail(user.email)
    this.launch()
  }

  static launch() {
    logger.log('Starting matchmaker...')
    this.reset()
    this.worker()
  }

  static reset() {
    if (this.timeout) {
      logger.log('Reset matchmaker')
      clearTimeout(this.timeout)
    }
  }

  private static worker() {
    logger.log('Worker invoked')
    if (!user.email) return logger.error('No user data!')
    const sleepMatchmakerFor = (millis: number): NodeJS.Timeout => {
      return setTimeout(this.worker.bind(this), millis)
    }
    logger.log('isCurrentDateNight', DateClockService.isCurrentDateNight)

    if (!DateClockService.isCurrentDateNight) {
      meetup.setDateNight(false)
      if (DateClockService.isExpired) return this.initialize()
      logger.log(
        `No current Date Night. Sleeping for ${Math.floor(
          fromMillisToMinutes(DateClockService.timeTilNextDateNight()) * 60
        )} seconds until the beginning of Date Night`
      )
      return (this.timeout = sleepMatchmakerFor(
        DateClockService.timeTilNextDateNight()
      ))
    }
    if (!meetup.isDateNight) {
      logger.log('Date Night has started!')
      meetup.setDateNight(true)
    }
    meetup.checkDatesActive()

    const currentInterval = DateClockService.currentInterval
    const maxActiveInterval = DateClockService.maxActiveIntervals
    logger.log('currentInterval', currentInterval)
    logger.log('maxActiveInterval', maxActiveInterval)

    if (currentInterval < maxActiveInterval) {
      if (user.free && user.here) {
        const threshold = maxActiveInterval - currentInterval

        MatchesService.inviteAndAcceptMatches(
          threshold,
          threshold + DateClockService.acceptDateDelay
        )
      } else logger.log("User doesn't have ability to invite or accept dates")

      logger.log(
        `Sleeping for ${Math.floor(
          fromMillisToMinutes(DateClockService.timeTilNextInterval()) * 60
        )} seconds until next interval`
      )
      return (this.timeout = sleepMatchmakerFor(
        DateClockService.timeTilNextInterval()
      ))
    }

    logger.log(
      `Sleeping for ${Math.floor(
        fromMillisToMinutes(DateClockService.timeTilNextRound()) * 60
      )} seconds until the beginning of next round`
    )
    return (this.timeout = sleepMatchmakerFor(
      DateClockService.timeTilNextRound()
    ))
  }
}
