import { FC } from 'react'
import { useHistory } from 'react-router'
import { AppButton } from '../../components/AppButton'
import { Screen } from '../../wrappers/Screen'
import stylesModule from './AuthIndex.module.scss'

export const AuthIndex: FC = () => {
  const history = useHistory()
  return (
    <Screen>
      <div className={stylesModule.container}>
        <AppButton onClick={() => history.push('/register')} color="dark" full>
          Sign up
        </AppButton>
        <AppButton onClick={() => history.push('/login')} color="light" full>
          Log in
        </AppButton>
      </div>
    </Screen>
  )
}
