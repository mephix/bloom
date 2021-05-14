import moduleStyles from './Header.module.scss'
import logo from '../../assets/images/bloom.jpeg'
import { useCallback } from 'react'
import { ActionButton } from '../Card/ActionButton'

export const Header = () => {
  const redirectToApp = useCallback(() => {
    window.location.replace('https://live.bloomdating.app/')
  }, [])
  return (
    <header className={moduleStyles.header}>
      <ActionButton onAction={redirectToApp} small />
      <img src={logo} className="logo" alt="Bloom" />
      <div className={moduleStyles.gap} />
    </header>
  )
}
