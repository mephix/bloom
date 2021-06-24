import {
  IonIcon,
  IonPage,
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

import { Profile } from 'pages/Main/Profile'
import { Matches } from 'pages/Main/Matches'
import { createContext, useState } from 'react'
import { useInitWaitingRoom } from 'hooks/init.waitingroom.hook'
import { useInitNotifications } from 'hooks/init.notifications'

export const AuthRoutes = () => {
  useStatusBar(Style.Light)
  return (
    <IonPage>
      <IonRouterOutlet mode="ios">
        <Route exact path="/">
          <AuthIndex />
        </Route>
        <Route path="/register">
          <Register />
        </Route>
        <Redirect to="/" />
      </IonRouterOutlet>
    </IonPage>
  )
}

export const TabContext = createContext({
  hideTabs: () => {},
  showTabs: () => {}
})

export const MainRoutes = () => {
  const [tabHidden, setTabHidden] = useState(false)
  useStatusBar(Style.Dark)
  useInitWaitingRoom()
  useInitNotifications()
  return (
    <TabContext.Provider
      value={{
        hideTabs: () => setTabHidden(true),
        showTabs: () => setTabHidden(false)
      }}
    >
      <IonTabs>
        <IonRouterOutlet animated={false}>
          <Route exact path="/waitingroom">
            <WaitingRoomApp />
          </Route>
          <Route path="/matches">
            <Matches />
          </Route>
          <Route path="/profile">
            <Profile />
          </Route>
          <Redirect to="/waitingroom" />
        </IonRouterOutlet>
        <IonTabBar hidden={tabHidden} color="primary" slot="bottom">
          <IonTabButton tab="matches" href="/matches">
            <IonIcon icon={heartOutline} />
          </IonTabButton>
          <IonTabButton tab="waitingroom" href="/waitingroom">
            <IonIcon icon={home} />
          </IonTabButton>
          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={personOutline} />
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </TabContext.Provider>
  )
}
