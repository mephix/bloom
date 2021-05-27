import { FC } from 'react'
import { useHistory } from 'react-router'
import { classes } from 'utils'
import { AppButton } from '../../components/AppButton'
import { Screen } from '../../wrappers/Screen'
import stylesModule from './AuthIndex.module.scss'
import logo from 'assets/images/logo.jpeg'

export const AuthIndex: FC = () => {
  const history = useHistory()
  return (
    <Screen color="dark">
      <div className={stylesModule.image}></div>
      <div className={classes(stylesModule.container, stylesModule.index)}>
        <AppButton
          onClick={() => history.push('/register')}
          color="primary"
          full
        >
          Sign up
        </AppButton>
        <AppButton onClick={() => history.push('/login')} color="light" full>
          Log in
        </AppButton>
      </div>
    </Screen>
  )
}
