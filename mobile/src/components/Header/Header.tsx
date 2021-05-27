import moduleStyles from './Header.module.scss'
import logo from '../../assets/images/bloom.jpeg'
import { useCallback } from 'react'
import { IonIcon } from '@ionic/react'
import { heartOutline, personOutline } from 'ionicons/icons'

export const Header = () => {
  const redirectToApp = useCallback(() => {
    window.location.replace('https://live.bloomdating.app/')
  }, [])
  return (
    <header className={moduleStyles.header}>
      <IonIcon icon={heartOutline} color="light" size="large" />

      <div className={moduleStyles.logo}>The zero date</div>
      <IonIcon icon={personOutline} color="light" size="large" />
    </header>
  )
}
