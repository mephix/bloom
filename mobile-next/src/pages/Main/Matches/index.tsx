import { IonRouterOutlet } from '@ionic/react'
import { Screen } from 'wrappers/Screen'
import { MatchesProfile } from './MatchesProfile'
import { MatchesList } from './MatchesList'
import { Route } from 'react-router-dom'
import { useState } from 'react'

export const initialUser = {
  avatar: '',
  name: '',
  bio: ''
}

export type UserInfo = typeof initialUser

export const Matches = () => {
  const [user, setUser] = useState(initialUser)

  return (
    <Screen>
      <IonRouterOutlet mode="ios">
        <Route exact path="/matches">
          <MatchesList setUserProfile={setUser} />
        </Route>
        <Route exact path="/matches/profile">
          <MatchesProfile user={user} />
        </Route>
      </IonRouterOutlet>
    </Screen>
  )
}
