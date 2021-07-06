import { AndroidPermissions } from '@ionic-native/android-permissions'
import { isPlatform } from '@ionic/react'
import { FirebaseService } from 'firebaseService'
import { PARAMETERS_COLLECTION } from 'firebaseService/constants'
import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { UserService } from 'services/user.service'
import { store, useAppDispatch } from 'store'
import { setAppParams, setAppState } from 'store/app'
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

export const useWaitingRoomOnline = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/waitingroom') UserService.setHiddenHere(true)
    else {
      const state = store.getState().app.state
      if (state === 'VIDEO') dispatch(setAppState('WAITING'))
      UserService.setHiddenHere(false)
    }
  }, [location, dispatch])
}

export function usePageVisibilityOnline() {
  useEffect(onlineSubscriber, [])
}

export function useUserEvents() {
  useEffect(() => UserService.subcribeOnEvents(), [])
}

function onlineSubscriber() {
  let unsubscribe: () => void = () => {}
  if (isPlatform('ios') || isPlatform('android')) {
    const blurHandler = () => {
      UserService.setHiddenHere(false)
    }
    const focusHandler = () => {
      UserService.setHiddenHere(true)
    }
    window.addEventListener('pageshow', focusHandler)
    window.addEventListener('pagehide', blurHandler)
    window.addEventListener('beforeunload', blurHandler)
    window.addEventListener('blur', blurHandler)
    window.addEventListener('focus', focusHandler)

    unsubscribe = () => {
      window.removeEventListener('pageshow', focusHandler)
      window.removeEventListener('pagehide', blurHandler)
      window.removeEventListener('beforeunload', blurHandler)
      window.removeEventListener('blur', blurHandler)
      window.removeEventListener('focus', focusHandler)
    }
  } else {
    const closeHandler = () => UserService.setHiddenHere(false)
    const visibilityChangeHandler = () => {
      if (document.hidden) UserService.setHiddenHere(false)
      else UserService.setHiddenHere(true)
    }
    window.addEventListener('beforeunload', closeHandler)
    window.addEventListener('visibilitychange', visibilityChangeHandler)
    unsubscribe = () => {
      window.removeEventListener('beforeunload', closeHandler)
      window.removeEventListener('visibilitychange', visibilityChangeHandler)
    }
  }
  return unsubscribe
}
