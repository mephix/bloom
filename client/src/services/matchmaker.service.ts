import meetup from '../store/meetup'
import { DateClockService, fromMillisToMinutes } from './dateClock.service'
import { Logger } from '../utils'
import { MatchesService } from './matches.service'
import user from '../store/user'

const logger = new Logger('Matchmaker', '#005aeb')

export class Matchmaker {
  static timeout: NodeJS.Timeout | null = null

  static async initialize() {
    logger.debug('Initialization')
    if (!user.email) throw new Error('No user defined!')
    await DateClockService.initNextDateNight()
    MatchesService.setEmail(user.email)
    this.launch()
  }

  static launch() {
    logger.debug('Starting matchmaker...')
    this.reset()
    this.worker()
  }

  static reset() {
    if (this.timeout) {
      logger.debug('Reset matchmaker')
      clearTimeout(this.timeout)
    }
  }

  private static worker() {
    logger.debug('Worker invoked')
    if (!user.email) return logger.error('No user data!')
    const sleepMatchmakerFor = (millis: number): NodeJS.Timeout => {
      return setTimeout(this.worker.bind(this), millis)
    }
    logger.log('isCurrentDateNight', DateClockService.isCurrentDateNight)

    if (!DateClockService.isCurrentDateNight) {
      meetup.setDateNight(false)
      if (DateClockService.isExpired) return this.initialize()
      logger.debug(
        `No current Date Night. Sleeping for ${Math.floor(
          fromMillisToMinutes(DateClockService.timeTilNextDateNight()) * 60
        )} seconds until the beginning of Date Night`
      )
      return (this.timeout = sleepMatchmakerFor(
        DateClockService.timeTilNextDateNight()
      ))
    }
    if (!meetup.isDateNight) {
      logger.debug('Date Night has started!')
      meetup.setDateNight(true)
    }
    const currentInterval = DateClockService.currentInterval
    const maxActiveInterval = DateClockService.maxActiveInterval
    logger.log('currentInterval', currentInterval)
    logger.log('maxActiveInterval', maxActiveInterval)

    if (currentInterval < maxActiveInterval) {
      if (user.free && user.here) {
        const threshold = maxActiveInterval - currentInterval

        // Todo: inviting and acceptring logic
        MatchesService.inviteMatches(threshold)
      } else logger.debug("User doesn't have ability to invite")

      logger.debug(
        `Sleeping for ${Math.floor(
          fromMillisToMinutes(DateClockService.timeTilNextInterval()) * 60
        )} seconds until next interval`
      )
      return (this.timeout = sleepMatchmakerFor(
        DateClockService.timeTilNextInterval()
      ))
    }

    logger.debug(
      `Sleeping for ${Math.floor(
        fromMillisToMinutes(DateClockService.timeTilNextRound()) * 60
      )} seconds until the beginning of next round`
    )
    return (this.timeout = sleepMatchmakerFor(
      DateClockService.timeTilNextRound()
    ))
  }
}
