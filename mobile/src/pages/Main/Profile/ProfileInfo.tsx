import { IonFab, IonFabButton, IonIcon, useIonAlert } from '@ionic/react'
import { Card } from 'components/Card'
import { auth } from 'firebaseService'
import { options, pencil } from 'ionicons/icons'
import { useCallback } from 'react'
import { useHistory } from 'react-router'
import { Screen } from 'wrappers/Screen'
import stylesModule from './Profile.module.scss'

export const ProfileInfo = () => {
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

  return (
    <Screen header color="dark">
      <Card
        type="profile"
        user={{
          name: 'John',
          bio: `At the beginning of each round of dates, the Matchmaker looks in the “Matches” collection, and finds the User’s matches, ranked in order of how good a match they are. It starts by creating dates for the User’s best matches. \nThen it waits for them to accept.\nWhen a User tries to join a date, we have to do a Firestore “transaction”, to avoid conflicts & race conditions. If they are able to join that date, we don’t want them to join another date as well during that round, or for someone else to join a date with them.\nThis project is not to build our whole app.\nWe built our app using nocode already and it is running live. This project is to build an MVP of our solution to a key problem in the video dating space - engagement - which we cannot solve with nocode.\nWe want to be able to offer people video dates with people they match with in near-real-time. In this project you will build the part of our app - the “Waiting Room” - where people can get these real time dates.\nWe built our app using nocode already and it is running live. This project is to build an MVP of our solution to a key problem in the video dating space - engagement - which we cannot solve with nocode.\nWe want to be able to offer people video dates with people they match with in near-real-time. In this project you will build the part of our app - the “Waiting Room” - where people can get these real time dates.`,
          avatar: ''
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
        <IonFabButton color="light">
          <IonIcon icon={options} />
        </IonFabButton>
      </IonFab>
    </Screen>
  )
}
