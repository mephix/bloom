import { IonChip, IonIcon, IonLabel } from '@ionic/react'
import { close, pin, heart } from 'ionicons/icons'
import { AppButton } from '../../components/AppButton'
import { AppInput } from '../../components/AppInput'
import { Screen } from '../../wrappers/Screen'
import stylesModule from './AuthIndex.module.scss'

export const Login = () => {
  return (
    <Screen>
      <div className={stylesModule.container}>
        <div className={stylesModule.titleWrap}>
          <span className={stylesModule.title}>Welcome Back!</span>
        </div>
        <AppInput full />
        <AppInput full />

        <AppButton color="dark" full>
          Login
        </AppButton>
        <AppButton
          style={{ margin: 0, fontSize: '0.9rem', color: 'grey' }}
          clear
        >
          Forgot password?
        </AppButton>
        <AppButton style={{ margin: 0, fontSize: '0.9rem' }} clear>
          Signup
        </AppButton>
      </div>
    </Screen>
  )
}
