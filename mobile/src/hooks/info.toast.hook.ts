import { useIonToast } from '@ionic/react'
import { useCallback } from 'react'

export const useInfoToast = (): [(message: string) => void, () => void] => {
  const [present, dismiss] = useIonToast()
  const show = useCallback(
    message =>
      present({
        message,
        color: 'light',
        duration: 3 * 1000,
        position: 'top'
      }),
    [present]
  )
  const hide = useCallback(() => dismiss(), [dismiss])
  return [show, hide]
}
