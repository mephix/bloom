import { observer } from 'mobx-react-lite'
import app from '../store/app'
import { Loader } from './Loader/Loader'
import { WaitingRoom } from './WaitingRoom'
import { CountDown } from './CountDown'
import { Video } from './Video'
import { Raiting } from './Raiting'

export const Screen = observer(() => {
  if (app.state === 'RATING') return <Raiting />
  if (app.state === 'VIDEO') return <Video />
  if (app.state === 'COUNTDOWN') return <CountDown />
  if (app.state === 'WAITING') return <WaitingRoom />
  return <Loader />
})
