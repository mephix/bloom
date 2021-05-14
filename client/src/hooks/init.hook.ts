import { useCallback, useEffect } from 'react'
import { Matchmaker } from '../services/matchmaker.service'
import { Logger } from '../utils'
import app from '../store/app'
import user from '../store/user'
import { MatchesService } from '../services/matches.service'

const logger = new Logger('Init', '#e38707')

export const useInit = () => {
  const init = useCallback(async () => {
    try {
      await app.initParams()
      const { email, log, matchesDisable } = getUrlParams()
      if (log) Logger.active = true
      if (matchesDisable) MatchesService.setDisabled(true)
      if (!email) throw new Error('No email provided')
      await user.setUser(email)
      await Matchmaker.initialize()
      user.signUser()
      app.setWaitingRoomState()
    } catch (err) {
      logger.error('error while initializing: ' + err.message)
    }
  }, [])

  useEffect(() => {
    init()
    const closeHandler = () => user.setHiddenHere(false)
    const visibilityChangeHandler = () => {
      if (document.hidden) user.setHiddenHere(false)
      else {
        user.setHiddenHere(true)
      }
    }
    window.addEventListener('beforeunload', closeHandler)
    window.addEventListener('visibilitychange', visibilityChangeHandler)
    return () => {
      window.removeEventListener('beforeunload', closeHandler)
      window.removeEventListener('visibilitychange', visibilityChangeHandler)
    }
  }, [init])
}

function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search)
  return {
    email: urlParams.get('email'),
    log: urlParams.get('log'),
    matchesDisable: urlParams.get('matches_disable')
  }
}
