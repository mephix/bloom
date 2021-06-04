import { useIonToast } from '@ionic/react'
import { useCallback } from 'react'

export const useErrorToast = () => {
  const [present] = useIonToast()
  const show = useCallback(
    message =>
      present({
        message,
        color: 'danger',
        duration: 3 * 1000,
        position: 'top'
      }),
    [present]
  )
  return show
}
