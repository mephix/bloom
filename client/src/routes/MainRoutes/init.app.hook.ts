import { isPlatform } from '@ionic/react'
import { useOnline } from 'hooks/online.hook'
import { useCallback, useEffect } from 'react'
import { MeetupService, useDateObserver } from 'services/meetup.service'
import { UserService } from 'services/user.service'
import { useAppDispatch } from 'store'
import { setAppState } from 'store/app'
// import { fetchMatches } from 'store/meetup'
import {
  checkPermission,
  isSafari,
  updateAppParams,
  usePageVisibilityOnline,
  useUserEvents,
  useWaitingRoomOnline
  // useIsWaitingRoom
} from './utils'

export const useInitApp = () => {
  const dispatch = useAppDispatch()
  // const isWaitingRoom = useIsWaitingRoom()

  const initApp = useCallback(async () => {
    // FirebaseService.functions.httpsCallable('testFetching')()
    if (isPlatform('ios') && !isSafari())
      return dispatch(setAppState('NOT_SAFARI'))
    const havePermissons = await checkPermission()
    if (!havePermissons) return dispatch(setAppState('NO_PERMISSIONS'))
    await updateAppParams()
    // dispatch(fetchMatches(null))
    await MeetupService.setupDateNight()
    MeetupService.updateProspects()
    MeetupService.updateMatches()
    UserService.setFree(true)
    dispatch(setAppState('WAITING'))
  }, [dispatch])

  useEffect(() => {
    initApp()
  }, [initApp])

  useUserEvents()
  useOnline()
  usePageVisibilityOnline()
  useWaitingRoomOnline()
  useDateObserver()
}
