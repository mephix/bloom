import { StatusBar, Style } from '@capacitor/status-bar'
import { isPlatform } from '@ionic/react'
import { useEffect } from 'react'

export const useStatusBar = (style: Style) => {
  useEffect(() => {
    if (!isPlatform('ios')) return
    StatusBar.setStyle({ style })
  }, [style])
}
