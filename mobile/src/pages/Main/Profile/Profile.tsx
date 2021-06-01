import { IonRouterOutlet } from '@ionic/react'
import { Route } from 'react-router-dom'
import { Screen } from 'wrappers/Screen'
import { EditScreen } from './EditScreen'
import { ProfileInfo } from './ProfileInfo'

export const Profile = () => {
  return (
    <Screen color="dark">
      <IonRouterOutlet mode="ios">
        <Route exact path="/profile">
          <ProfileInfo />
        </Route>
        <Route exact path="/profile/edit">
          <EditScreen />
        </Route>
      </IonRouterOutlet>
    </Screen>
  )
}
