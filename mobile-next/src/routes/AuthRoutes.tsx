import {
  IonIcon,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/react'
import { Redirect, Route } from 'react-router-dom'
import { Style } from '@capacitor/status-bar'
import { useStatusBar } from 'hooks/status-bar.hook'
import { AuthIndex } from 'pages/Auth/AuthIndex'
import { PhoneNumberScreen } from 'pages/Auth/Register/PhoneNumberScreen'
import { useRegisterState } from 'pages/Auth/Register/register.state.hook'
import { CodeScreen } from 'pages/Auth/Register/CodeScreen'
import { GetInfoScreen } from 'pages/Auth/Register/GetInfoScreen'

export const AuthRoutes = () => {
  useStatusBar(Style.Light)
  const register = useRegisterState()
  return (
    <IonPage>
      <IonRouterOutlet mode="ios">
        <Route exact path="/">
          <AuthIndex />
        </Route>
        <Route exact path="/register">
          <PhoneNumberScreen register={register} />
        </Route>
        <Route exact path="/register/code">
          <CodeScreen register={register} />
        </Route>
        <Route exact path="/register/get-info">
          <GetInfoScreen />
        </Route>
        <Redirect to="/" />
      </IonRouterOutlet>
    </IonPage>
  )
}
