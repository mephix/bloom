import { StatusBar, Style } from '@capacitor/status-bar'
import { useEffect } from 'react'

export const useStatusBar = (style: Style) => {
  useEffect(() => {
    StatusBar.setStyle({ style })
  }, [style])
}
