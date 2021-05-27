import { WaitingRoomScreen } from './screens'
import 'assets/css/index.scss'
import './WaitingRoomApp.scss'
import { useInitWaitingRoom } from 'hooks/init.waitingroom.hook'
import { Screen } from 'wrappers/Screen'

export const WaitingRoomApp = () => {
  useInitWaitingRoom()
  return (
    <Screen>
      <WaitingRoomScreen />
    </Screen>
  )
}
