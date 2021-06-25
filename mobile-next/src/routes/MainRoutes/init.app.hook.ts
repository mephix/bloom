import { isPlatform } from '@ionic/react'
import { useCallback, useEffect } from 'react'
import { useAppDispatch } from 'store'
import { setAppState } from 'store/app'
import { fetchMatches } from 'store/meetup'
import {
  checkPermission,
  isSafari,
  updateAppParams,
  useIsWaitingRoom
} from './utils'

export const useInitApp = () => {
  const dispatch = useAppDispatch()
  const isWaitingRoom = useIsWaitingRoom()

  const initApp = useCallback(async () => {
    await updateAppParams()
    dispatch(fetchMatches(null))
    if (isPlatform('ios') && !isSafari())
      return dispatch(setAppState('NOT_SAFARI'))
    const havePermissons = await checkPermission()
    if (!havePermissons) return dispatch(setAppState('NO_PERMISSIONS'))
    if (!isWaitingRoom) {
    }
    dispatch(setAppState('WAITING'))
  }, [dispatch])

  useEffect(() => {
    initApp()
  }, [initApp])
}
