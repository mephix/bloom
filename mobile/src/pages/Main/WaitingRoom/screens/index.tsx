import { observer } from 'mobx-react-lite'
import app from 'state/app'
import { Loader } from './Loader/Loader'
import { WaitingRoom } from './WaitingRoom'
import { Video } from './Video'
import { Raiting } from './Raiting'
import { NoPermissions } from './NoPermissions'
import { Screen } from 'wrappers/Screen'
import { NotSafari } from './NotSafari'

export const WaitingRoomScreen = observer(() => {
  if (app.state === 'RATING') return <Raiting />
  if (app.state === 'VIDEO') return <Video />
  if (app.state === 'WAITING')
    return (
      <Screen header color="dark">
        <WaitingRoom />
      </Screen>
    )
  if (app.state === 'NO_PERMISSIONS')
    return (
      <Screen header color="dark">
        <NoPermissions />
      </Screen>
    )
  if (app.state === 'NOT_SAFARI')
    return (
      <Screen header color="dark">
        <NotSafari />
      </Screen>
    )
  return (
    <Screen header color="dark">
      <Loader />
    </Screen>
  )
})
