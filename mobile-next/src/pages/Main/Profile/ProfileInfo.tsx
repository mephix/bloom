import { IonFab, IonFabButton, IonIcon, useIonAlert } from '@ionic/react'
import { Card } from 'components/Card'
import { FirebaseService } from 'firebaseService'
import { options, pencil } from 'ionicons/icons'
import { useCallback } from 'react'
import { useHistory } from 'react-router'
import { useAppSelector } from 'store'
import { selectUserData } from 'store/user'
import { Screen } from 'wrappers/Screen'
import { LowerIonFab } from './styled'
// import stylesModule from './Profile.module.scss'

export const ProfileInfo = () => {
  const user = useAppSelector(selectUserData)
  const history = useHistory()
  const [present] = useIonAlert()
  const logoutHandler = useCallback(() => {
    present('Are you sure you want to log out?', [
      { text: 'Cancel' },
      {
        text: 'Yes',
        handler: () => FirebaseService.auth().signOut()
      }
    ])
  }, [present])

  const editHandler = useCallback(() => {
    history.push('/profile/edit')
  }, [history])

  const optionsHandler = useCallback(() => {
    history.push('/profile/options')
  }, [history])

  return (
    <Screen header fixed color="dark">
      <Card
        type="profile"
        user={{
          name: user.firstName,
          bio: user.bio,
          avatar: user.avatar
        }}
        onResolve={logoutHandler}
      />
      <IonFab color="light" vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={editHandler} color="light">
          <IonIcon icon={pencil} />
        </IonFabButton>
      </IonFab>
      <LowerIonFab color="light" vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={optionsHandler} color="light">
          <IonIcon icon={options} />
        </IonFabButton>
      </LowerIonFab>
    </Screen>
  )
}
