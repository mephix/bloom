import LogRocket from 'logrocket'
import { useCallback, useEffect } from 'react'
import { isProd, Logger } from 'utils'
import app from 'state/app'
import user from 'state/user'
import { isPlatform } from '@ionic/react'
import { AndroidPermissions } from '@ionic-native/android-permissions'
import { useHistory } from 'react-router'
import matches from 'state/matches'

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

      logger.log('Main app initialization')
      logger.log(`Log in as ${user.id}`)
      if (isProd) {
        logger.log('Initialize LogRocket')
        LogRocket.init('isym43/the-zero-date', {
          dom: {
            baseHref: 'https://bloom-dating.web.app'
          }
        })
        LogRocket.identify(user.id!, {
          name: user.firstName
        })
      }
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
  if (
    (isPlatform('android') || isPlatform('ios')) &&
    !isPlatform('mobileweb')
  ) {
    try {
      logger.log('mobile')
      let havePermissions = true
      for (const perm of ANDROID_PERMISSIONS) {
        let res = await AndroidPermissions.checkPermission(perm)
        if (!res.hasPermission)
          res = await AndroidPermissions.requestPermission(perm)
        // alert(`${perm} ${JSON.stringify(res)}`)
        havePermissions = !res.hasPermission && havePermissions ? false : true
      }
      return havePermissions
    } catch (err) {
      logger.log('error', err)
      return false
    }
  }
  logger.log('web')
  return true
}
