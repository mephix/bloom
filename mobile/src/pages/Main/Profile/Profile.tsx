import { IonPage, IonRouterOutlet } from '@ionic/react'
import { Route } from 'react-router-dom'
import { Screen } from 'wrappers/Screen'
import { EditScreen } from './EditScreen'
import { OptionsScreen } from './OptionsScreen'
import { ProfileInfo } from './ProfileInfo'

export const Profile = () => {
  return (
    <IonPage>
      <IonRouterOutlet mode="ios">
        <Route exact path="/profile">
          <ProfileInfo />
        </Route>
        <Route exact path="/profile/edit">
          <EditScreen />
        </Route>
        <Route exact path="/profile/options">
          <OptionsScreen />
        </Route>
      </IonRouterOutlet>
    </IonPage>
  )
}
