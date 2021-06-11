import { useIonToast } from '@ionic/react'
import { useCallback } from 'react'

export const useErrorToast = () => {
  const [present] = useIonToast()
  const show = useCallback(
    (message, sec = 3) =>
      present({
        message,
        color: 'danger',
        duration: sec * 1000,
        position: 'top'
      }),
    [present]
  )
  return show
}
