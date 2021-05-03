import { useCallback } from 'react'
import { Card } from '../../components/Card'
import { Toggle } from '../../components/Toggle'
import commonStyles from '../Common.module.scss'
import moduleStyles from './WaitingRoom.module.scss'
import { AppBarHeader } from '../../components/AppBarHeader'
import { classes } from '../../utils'
import { observer } from 'mobx-react-lite'
// import app from '../../store/app'
import user from '../../store/user'

const toggleMessages = {
  on: 'I want to go on dates',
  off: "I don't want to go on dates"
}

const mockUser = {
  avatar: '/docs/placeholder.jpg',
  name: 'Name',
  bio: 'this is a bio \n can have multiple lines'
}

export const WaitingRoom = observer(() => {
  const toggleHandler = useCallback(state => user.setHere(state), [])

  const resolveHandler = useCallback(() => {
    console.log('resolve user')
  }, [])
  const rejectHandler = useCallback(() => {
    console.log('reject user')
  }, [])

  return (
    <>
      <AppBarHeader />
      <div className={classes(commonStyles.container, moduleStyles.container)}>
        <Toggle
          className={moduleStyles.toggle}
          toggleMessages={toggleMessages}
          toggled={user.here}
          onToggle={toggleHandler}
        />
        <Card
          type={user.here ? 'join' : 'invite'}
          user={mockUser}
          onResolve={resolveHandler}
          onReject={rejectHandler}
        />
      </div>
    </>
  )
})
