import {
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/react'
import { WaitingRoomApp } from 'pages/Main/WaitingRoom'
import { Redirect, Route } from 'react-router-dom'
import { AuthIndex } from 'pages/Auth/AuthIndex'
import { Register } from 'pages/Auth/Register'
import { useStatusBar } from 'hooks/status-bar.hook'
import { Style } from '@capacitor/status-bar'
import { heartOutline, home, personOutline } from 'ionicons/icons'
import { Screen } from 'wrappers/Screen'
import { Profile } from 'pages/Main/Profile'
import { Header } from 'components/Header'

export const AuthRoutes = () => {
  useStatusBar(Style.Light)
  return (
    <IonRouterOutlet mode="ios">
      <Route exact path="/">
        <AuthIndex />
      </Route>
      <Route path="/register">
        <Register />
      </Route>
      <Redirect to="/" />
    </IonRouterOutlet>
  )
}
export const MainRoutes = () => {
  useStatusBar(Style.Dark)
  return (
    <IonTabs>
      <IonRouterOutlet mode="ios">
        <Route exact path="/waitingroom">
          <WaitingRoomApp />
        </Route>
        <Route path="/matches">
          <Screen header>No Matches Yet...</Screen>
        </Route>
        <Route path="/profile">
          <Profile />
        </Route>
        <Redirect to="/waitingroom" />
      </IonRouterOutlet>
      <IonTabBar color="primary" slot="bottom">
        <IonTabButton tab="matches" href="/matches">
          <IonIcon style={{ fontSize: '26px' }} icon={heartOutline} />
        </IonTabButton>
        <IonTabButton tab="waitingroom" href="/waitingroom">
          <IonIcon icon={home} />
        </IonTabButton>
        <IonTabButton tab="profile" href="/profile">
          <IonIcon icon={personOutline} />
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  )
}
