import { WaitingRoomScreen } from './screens'
import 'assets/css/index.scss'
import './WaitingRoomApp.scss'
import { Screen } from 'wrappers/Screen'

export const WaitingRoomApp = () => {
  return (
    <Screen header color="dark">
      <WaitingRoomScreen />
    </Screen>
  )
}
