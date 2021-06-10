import { StatusBar, Style } from '@capacitor/status-bar'
import { getPlatforms, isPlatform } from '@ionic/react'
import { useEffect } from 'react'

export const useStatusBar = (style: Style) => {
  useEffect(() => {
    console.log(getPlatforms())
    if (!isPlatform('ios') || isPlatform('mobileweb')) return
    StatusBar.setStyle({ style })
  }, [style])
}
