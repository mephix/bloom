import { IonRouterOutlet } from '@ionic/react'
import { WaitingRoomApp } from 'pages/Main/WaitingRoom'
import { Redirect, Route } from 'react-router-dom'
import { AuthIndex } from 'pages/Auth/AuthIndex'
import { Login } from 'pages/Auth/Login'
import { Register } from 'pages/Auth/Register'
import { useStatusBar } from 'hooks/status-bar.hook'
import { Style } from '@capacitor/status-bar'

export const AuthRoutes = () => {
  useStatusBar(Style.Light)
  return (
    <IonRouterOutlet mode="ios">
      <Route exact path="/">
        <AuthIndex />
      </Route>
      <Route exact path="/login">
        <Login />
      </Route>
      <Route path="/register">
        <Register />
      </Route>
      <Redirect to="/" />
    </IonRouterOutlet>
  )
}
export const MainRoutes = () => {
  useStatusBar(Style.Dark)
  return (
    <>
      <Route exact path="/waitingroom">
        <WaitingRoomApp />
      </Route>
      <Route exact path="/matches">
        <>Matches</>
      </Route>
      <Route exact path="/profile">
        <>Profile</>
      </Route>
      <Redirect to="/waitingroom" />
    </>
  )
}
