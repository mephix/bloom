import { IonApp } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'

/* Theme variables */
import './scss/App.scss'
import './theme/variables.css'
import { AuthRoutes, MainRoutes } from './routes'
import { observer } from 'mobx-react-lite'
import user from 'state/user'
import { useInit } from 'hooks/init'
import { LoaderPage } from 'pages/LoaderPage'
import { FC } from 'react'

const App: FC = () => {
  useInit()
  let appContext
  if (user.auth === null) appContext = <LoaderPage />
  else if (user.auth) appContext = <MainRoutes />
  else appContext = <AuthRoutes />
  return (
    <IonApp>
      <IonReactRouter>{appContext}</IonReactRouter>
    </IonApp>
  )
}

export default observer(App)