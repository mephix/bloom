import { isPlatform } from '@ionic/react'
import { useOnline } from 'hooks/online.hook'
import { useCallback, useEffect } from 'react'
import { MeetupService, useDateObserver } from 'services/meetup.service'
import { UserService } from 'services/user.service'
import { useAppDispatch } from 'store'
import { setAppState } from 'store/app'
import {
  checkPermission,
  isSafari,
  updateAppParams,
  usePageVisibilityOnline,
  useSetupNotifications,
  useUserEvents,
  useUserStatus,
  useWaitingRoomOnline
} from './utils'

export const useInitApp = () => {
  const dispatch = useAppDispatch()

  const initApp = useCallback(async () => {
    if (isPlatform('ios') && !isSafari())
      return dispatch(setAppState('NOT_SAFARI'))
    const havePermissons = await checkPermission()
    if (!havePermissons) return dispatch(setAppState('NO_PERMISSIONS'))
    await updateAppParams()
    await MeetupService.setupDateNight()
    MeetupService.updateProspects()
    MeetupService.updateMatches()
    UserService.setFree(true)
    dispatch(setAppState('WAITING'))
  }, [dispatch])

  useEffect(() => {
    initApp()
  }, [initApp])

  useSetupNotifications()
  useUserEvents()
  useUserStatus()
  useOnline()
  usePageVisibilityOnline()
  useWaitingRoomOnline()
  useDateObserver()
}
