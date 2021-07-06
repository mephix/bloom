import React from 'react'
import ReactDOM from 'react-dom'
import { App } from './App'
import { store } from './store'
import { Provider } from 'react-redux'
import { GlobalStyle } from './GlobalStyle'
import { ThemeProvider } from 'styled-components'
import * as serviceWorker from './serviceWorkerRegistration'
import { THEME } from 'theme/theme'

/* Ionic styles */
import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'
import './theme/variables.css'
import { FirebaseService } from 'firebaseService'

// @ts-ignore
window.addProspects = () => {
  FirebaseService.functions
    .httpsCallable('TEST_addProspects')()
    .catch(err => console.error(err))
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={THEME}>
        <GlobalStyle />
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)

serviceWorker.unregister()
