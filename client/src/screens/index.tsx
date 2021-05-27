import { observer } from 'mobx-react-lite'
import app from '../state/app'
import { Loader } from './Loader/Loader'
import { WaitingRoom } from './WaitingRoom'
import { Video } from './Video'
import { Raiting } from './Raiting'
import { NoPermissions } from './NoPermissions'

export const Screen = observer(() => {
  if (app.state === 'RATING') return <Raiting />
  if (app.state === 'VIDEO') return <Video />
  if (app.state === 'WAITING') return <WaitingRoom />
  if (app.state === 'NO_PERMISSIONS') return <NoPermissions />
  return <Loader />
})
