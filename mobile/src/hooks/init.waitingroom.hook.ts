import LogRocket from 'logrocket'
import { useCallback, useEffect } from 'react'
import { Matchmaker } from 'services/matchmaker.service'
import { isProd, Logger } from 'utils'
import app from 'state/app'
import user from 'state/user'
import { MatchesService } from '../services/matches.service'
import { isPlatform } from '@ionic/react'
import { AndroidPermissions } from '@ionic-native/android-permissions'
// import {} from 'cordova-plugin-iosrtc'

const logger = new Logger('Init', '#e38707')

const ANDROID_PERMISSIONS = [
  AndroidPermissions.PERMISSION.CAMERA,
  AndroidPermissions.PERMISSION.MODIFY_AUDIO_SETTINGS,
  AndroidPermissions.PERMISSION.RECORD_AUDIO
]

export const useInitWaitingRoom = () => {
  const init = useCallback(async () => {
    try {
      if (isProd) LogRocket.init('isym43/the-zero-date')
      await app.initParams()
      const { email, matchesDisable } = getUrlParams()
      Logger.active = true
      if (matchesDisable) MatchesService.setDisabled(true)
      if (!email) throw new Error('No email provided')
      await user.setUser(email)
      await Matchmaker.initialize()
      const havePermissons = await checkPermission()
      if (!havePermissons) return app.setNoPermissionsState()
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
  // const email = urlParams.get('email') || prompt('Enter your email address')
  return {
    email: 'test@example.com',
    matchesDisable: urlParams.get('matches_disable')
  }
}

async function checkPermission() {
  if (isPlatform('android') || isPlatform('ios')) {
    try {
      let havePermissions = true
      for (const perm of ANDROID_PERMISSIONS) {
        let res = await AndroidPermissions.checkPermission(perm)
        if (!res.hasPermission)
          res = await AndroidPermissions.requestPermission(perm)
        alert(`${perm} ${JSON.stringify(res)}`)
        havePermissions = !res.hasPermission && havePermissions ? false : true
      }
      return havePermissions
    } catch {
      return false
    }
  }

  if (!('mediaDevices' in navigator)) return false
  try {
    const AudioStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    })
    AudioStream.getTracks().forEach(track => track.stop())
    return true
  } catch (err) {
    alert('Error while getting permissions ' + err.message)
    return false
  }
}
