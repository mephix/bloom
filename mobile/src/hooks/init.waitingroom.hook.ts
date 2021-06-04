import LogRocket from 'logrocket'
import { useCallback, useEffect } from 'react'
import { Matchmaker } from 'services/matchmaker.service'
import { isProd, Logger } from 'utils'
import app from 'state/app'
import user from 'state/user'
import { isPlatform } from '@ionic/react'
import { AndroidPermissions } from '@ionic-native/android-permissions'
import { useHistory } from 'react-router'
import { auth } from 'firebaseService'
import matches from 'state/matches'
// import {} from 'cordova-plugin-iosrtc'

const logger = new Logger('Init', '#e38707')

const ANDROID_PERMISSIONS = [
  AndroidPermissions.PERMISSION.CAMERA,
  AndroidPermissions.PERMISSION.MODIFY_AUDIO_SETTINGS,
  AndroidPermissions.PERMISSION.RECORD_AUDIO
]

export const useInitWaitingRoom = () => {
  const history = useHistory()

  const init = useCallback(async () => {
    try {
      // console.log('phone number', auth().currentUser?.phoneNumber)
      if (isProd) LogRocket.init('isym43/the-zero-date')
      logger.log('Main app initialization')
      await app.init()
      matches.fetchLastDateUsers()
      const havePermissons = await checkPermission()
      if (!havePermissons) return app.setNoPermissionsState()
      if (history.location.pathname !== '/waitingroom')
        user.setHiddenHere(false)
      app.setWaitingRoomState()
    } catch (err) {
      logger.error('error while initializing: ' + err.message)
    }
  }, [history])

  useEffect(() => {
    init()
    const historyUnsubscribe = history.listen(location => {
      if (location.pathname === '/waitingroom') user.setHiddenHere(true)
      else user.setHiddenHere(false)
    })
    const unsignUser = user.signUser()

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
      logger.log('Reset initialization')
      closeHandler()
      historyUnsubscribe()
      unsignUser()
    }
  }, [init, history])
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
