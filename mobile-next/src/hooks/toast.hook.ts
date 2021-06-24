import { useIonToast } from '@ionic/react'
import { useCallback } from 'react'

type ToastType = 'info' | 'error'

export const useToast = (
  type: ToastType = 'info'
): [(message: string, sec?: number) => void, () => void] => {
  const [present, dismiss] = useIonToast()
  const show = useCallback(
    (message, sec = 3) =>
      present({
        message,
        color: defineToastColor(type),
        duration: sec * 1000,
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
