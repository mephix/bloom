import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import logo from '../assets/images/bloom.jpeg'
import { useCallback } from 'react'

export const AppBarHeader = () => {
  const redirectToApp = useCallback(() => {
    window.location.replace('https://live.bloomdating.app/')
  }, [])
  return (
    <AppBar position="static" className="app-bar">
      <Toolbar>
        <IconButton onClick={redirectToApp} aria-label="delete">
          <CloseIcon className="close" />
        </IconButton>

        <img src={logo} className="logo" alt="Bloom" />
      </Toolbar>
    </AppBar>
  )
}
