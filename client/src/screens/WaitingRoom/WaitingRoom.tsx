import { FC, useCallback, useState } from 'react'
import { Card } from '../../components/Card'
import { Toggle } from '../../components/Toggle'
import { WaitingRoomProps } from './WaitingRoom.type'
import commonStyles from '../Common.module.scss'
import moduleStyles from './WaitingRoom.module.scss'

const toggleMessages = {
  on: 'I want to go on dates',
  off: "I don't want to go on dates"
}

export const WaitingRoom: FC<WaitingRoomProps> = ({ user }) => {
  const [isJoin, setIsJoin] = useState<boolean>(false)

  const toggleHandler = useCallback(state => setIsJoin(state), [setIsJoin])

  const resolveHandler = useCallback(() => {
    console.log('resolve user')
  }, [])
  const rejectHandler = useCallback(() => {
    console.log('reject user')
  }, [])

  return (
    <div className={commonStyles.container}>
      <Toggle
        className={moduleStyles.toggle}
        toggleMessages={toggleMessages}
        toggled={isJoin}
        onToggle={toggleHandler}
      />
      <Card
        type={isJoin ? 'join' : 'invite'}
        user={user}
        onResolve={resolveHandler}
        onReject={rejectHandler}
      />
    </div>
  )
}
