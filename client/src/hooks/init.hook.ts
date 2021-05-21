import LogRocket from 'logrocket'
import { useCallback, useEffect } from 'react'
import { Matchmaker } from '../services/matchmaker.service'
import { isProd, Logger } from '../utils'
import app from '../store/app'
import user from '../store/user'
import { MatchesService } from '../services/matches.service'
import { AndroidPermissions } from '@ionic-native/android-permissions'
import { isPlatform } from '@ionic/react'

const logger = new Logger('Init', '#e38707')

export const useInit = () => {
  const init = useCallback(async () => {
    try {
      if (isProd) LogRocket.init('isym43/the-zero-date')
      await app.initParams()
      await getPerms([
        AndroidPermissions.PERMISSION.CAMERA,
        AndroidPermissions.PERMISSION.MODIFY_AUDIO_SETTINGS,
        AndroidPermissions.PERMISSION.RECORD_AUDIO
      ])

      const { email, matchesDisable } = getUrlParams()
      Logger.active = true
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

async function getPerms(perms: string[]) {
  // const res = await navigator.permissions.query({ name: 'microphone' })
  // alert(`prems ${JSON.stringify(res)}`)
  if (isPlatform('android')) {
    try {
      const permsList = []
      for (const perm of perms) {
        let res = await AndroidPermissions.checkPermission(perm)
        if (!res.hasPermission)
          res = await AndroidPermissions.requestPermission(perm)
        permsList.push({ perm, hasPerm: res.hasPermission })
      }
      alert(JSON.stringify(permsList))
    } catch {}
  }
}

function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search)
  const email = urlParams.get('email') || prompt('Enter your email address')
  return {
    email,
    matchesDisable: urlParams.get('matches_disable')
  }
}
