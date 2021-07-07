import { Style } from '@capacitor/status-bar'
import {
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/react'
import { useStatusBar } from 'hooks/status-bar.hook'
import { Redirect, Route } from 'react-router'
import { heartOutline, home, personOutline } from 'ionicons/icons'
import { useTabContext } from './TabContext'
import { Profile } from 'pages/Main/Profile'
import { Matches } from 'pages/Main/Matches'
import { WaitingRoom } from 'pages/Main/WaitingRoom'
import { useInitApp } from './init.app.hook'

export const MainRoutes = () => {
  useStatusBar(Style.Dark)
  useInitApp()
  const { TabContextProvider, value, tabHidden } = useTabContext()
  return (
    <IonTabs>
      <IonRouterOutlet animated={false}>
        <TabContextProvider value={value}>
          <Route exact path="/waitingroom">
            <WaitingRoom />
          </Route>
          <Route path="/matches">
            <Matches />
          </Route>
          <Route path="/profile">
            <Profile />
          </Route>
          <Redirect to="/waitingroom" />
        </TabContextProvider>
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
  )
}