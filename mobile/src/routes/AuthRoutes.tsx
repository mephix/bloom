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
import { Screen } from 'wrappers/Screen'

export const AuthRoutes = () => {
  useStatusBar(Style.Light)
  return (
    <IonPage>
      <IonRouterOutlet mode="ios">
        <Route exact path="/">
          <AuthIndex />
        </Route>
        <Route path="/register">
          {/* <Register /> */}
          <Screen>Register</Screen>
        </Route>
        <Redirect to="/" />
      </IonRouterOutlet>
    </IonPage>
  )
}
