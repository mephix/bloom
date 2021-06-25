import { AndroidPermissions } from '@ionic-native/android-permissions'
import { isPlatform } from '@ionic/react'
import { FirebaseService } from 'firebaseService'
import { PARAMETERS_COLLECTION } from 'firebaseService/constants'
import { useLocation } from 'react-router'
import { store } from 'store'
import { setAppParams } from 'store/app'
import { Params } from 'store/app/types'

export async function updateAppParams() {
  const updatedParams: any = {}
  for (const [name, param] of Object.entries(Params)) {
    const doc = await FirebaseService.db
      .collection(PARAMETERS_COLLECTION)
      .doc(param)
      .get()
    updatedParams[name] = doc?.data()?.text
  }
  store.dispatch(setAppParams(updatedParams))
}

export function subcribeOnAppParams(callback: () => void) {
  return FirebaseService.db.collection(PARAMETERS_COLLECTION).onSnapshot
}

export function isSafari() {
  return (
    navigator?.vendor?.indexOf('Apple') > -1 &&
    navigator?.userAgent?.indexOf('CriOS') === -1 &&
    navigator?.userAgent?.indexOf('FxiOS') === -1
  )
}

const ANDROID_PERMISSIONS = [
  AndroidPermissions.PERMISSION.CAMERA,
  AndroidPermissions.PERMISSION.MODIFY_AUDIO_SETTINGS,
  AndroidPermissions.PERMISSION.RECORD_AUDIO
]

export async function checkPermission() {
  if (isPlatform('hybrid')) {
    try {
      let havePermissions = true
      for (const perm of ANDROID_PERMISSIONS) {
        let res = await AndroidPermissions.checkPermission(perm)
        if (!res.hasPermission)
          res = await AndroidPermissions.requestPermission(perm)
        havePermissions = !res.hasPermission && havePermissions ? false : true
      }
      return havePermissions
    } catch (err) {
      console.error('error', err)
      return false
    }
  }
  return true
}

export const useIsWaitingRoom = () => {
  const location = useLocation()
  return location.pathname === '/waitingroom'
}
