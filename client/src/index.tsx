import React from 'react'
import ReactDOM from 'react-dom'
import './assets/css/index.scss'
import { App } from './App'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import reportWebVitals from './reportWebVitals'
import { isPlatform } from '@ionic/react'



document.addEventListener('deviceready', () => {
  if (isPlatform('ios')) {
    const plugins = cordova.plugins as any
    plugins.iosrtc.registerGlobals()
  }
})

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

serviceWorkerRegistration.unregister()

reportWebVitals()
