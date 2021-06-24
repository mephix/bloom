import { useIonToast } from '@ionic/react'
import { useCallback } from 'react'

type ToastType = 'info' | 'error'

export const useToast = (
  type: ToastType = 'info'
): [(message: string) => void, () => void] => {
  const [present, dismiss] = useIonToast()
  const show = useCallback(
    message =>
      present({
        message,
        color: defineToastColor(type),
        duration: 3 * 1000,
        position: 'top'
      }),
    [present, type]
  )
  const hide = useCallback(() => dismiss(), [dismiss])
  return [show, hide]
}

function defineToastColor(type: ToastType) {
  switch (type) {
    case 'info':
      return 'light'
    case 'error':
      return 'danger'
  }
}
