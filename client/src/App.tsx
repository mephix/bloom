import { IonApp } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { useAuth } from 'hooks/auth.hook'
import { LoaderPage } from 'pages/LoaderPage'
import { AuthStatus } from 'store/user/types'
import { AuthRoutes, MainRoutes } from 'routes'

export const App = () => {
  const auth = useAuth()
  const appContext = defineContext(auth)
  return (
    <IonApp>
      <IonReactRouter>{appContext}</IonReactRouter>
    </IonApp>
  )
}

function defineContext(auth: AuthStatus) {
  switch (auth) {
    case 'unknown':
      return <LoaderPage />
    case 'authorized':
      return <MainRoutes />
    default:
      return <AuthRoutes />
  }
}
