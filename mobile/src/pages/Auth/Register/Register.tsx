import { IonPage, IonRouterOutlet } from '@ionic/react'
import { Route } from 'react-router-dom'
import { CodeScreen } from './CodeScreen'
import { GetInfoScreen } from './GetInfoScreen'
import { PhoneNumberScreen } from './PhoneNumberScreen'
// import { DEFAULT_REGISTER_CONTEXT, RegisterContext } from './RegisterContext'
import { RestoreAccount } from './RestoreAccount'

export const Register = () => {
  return (
    <IonPage>
      <IonRouterOutlet mode="ios">
        <Route exact path="/register">
          <PhoneNumberScreen />
        </Route>
        <Route exact path="/register/code">
          <CodeScreen />
        </Route>
        <Route exact path="/register/get-info">
          <GetInfoScreen />
        </Route>
        <Route exact path="/register/restore">
          <RestoreAccount />
        </Route>
      </IonRouterOutlet>
    </IonPage>
  )
}
