import { IonFab, IonFabButton, IonIcon, useIonAlert } from '@ionic/react'
import { Card } from 'components/Card'
import { auth } from 'firebaseService'
import { options, pencil } from 'ionicons/icons'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { useHistory } from 'react-router'
import user from 'state/user'
import { Screen } from 'wrappers/Screen'
import stylesModule from './Profile.module.scss'

export const ProfileInfo = observer(() => {
  const history = useHistory()
  const [present] = useIonAlert()
  const logoutHandler = useCallback(() => {
    present('Are you sure you want to log out?', [
      { text: 'Cancel' },
      {
        text: 'Yes',
        handler: () => auth().signOut()
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
    <Screen header color="dark">
      {/* <div className={stylesModule.container}></div> */}
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
      <IonFab
        color="light"
        vertical="top"
        className={stylesModule.lowerFab}
        horizontal="end"
        slot="fixed"
      >
        <IonFabButton onClick={optionsHandler} color="light">
          <IonIcon icon={options} />
        </IonFabButton>
      </IonFab>
    </Screen>
  )
})
