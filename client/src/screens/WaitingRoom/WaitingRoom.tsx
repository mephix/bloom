import { useCallback } from 'react'
import { Card } from '../../components/Card'
import { Toggle } from '../../components/Toggle'
import commonStyles from '../Common.module.scss'
import moduleStyles from './WaitingRoom.module.scss'
import { AppBarHeader } from '../../components/AppBarHeader'
import { classes } from '../../utils'
import { observer } from 'mobx-react-lite'
import user from '../../store/user'
import date from '../../store/date'
import app from '../../store/app'
import { PARAMS } from '../../store/constants'

const mockUser = {
  avatar: '/docs/placeholder.jpg',
  name: 'Name',
  bio: 'this is a bio \n can have multiple lines',
}

export const WaitingRoom = observer(() => {
  const toggleHandler = useCallback(state => user.setHere(state), [])

  const resolveHandler = useCallback(() => {
    console.log('resolve user')
    date.unshiftProspects()
  }, [])
  const rejectHandler = useCallback(() => {
    date.unshiftProspects(true)
    console.log('reject user')
  }, [])

  const topUser = date.prospects.length > 0 && date.prospects[0]

  const card = topUser ? (
    <Card
      type={user.here ? 'invite' : 'like'}
      user={{
        avatar: mockUser.avatar,
        name: topUser.firstName,
        bio: topUser.bio,
      }}
      onResolve={resolveHandler}
      onReject={rejectHandler}
    />
  ) : (
    <div>{app.params[PARAMS.SETTING_YOU_UP]}</div>
  )

  return (
    <>
      <AppBarHeader />
      <div className={classes(commonStyles.container, moduleStyles.container)}>
        <Toggle
          className={moduleStyles.toggle}
          toggleMessages={{
            on: app.params[PARAMS.WANT_TO_GO_ON_DATES],
            off: app.params[PARAMS.DONT_WANT_TO_GO_ON_DATES],
          }}
          toggled={user.here}
          onToggle={toggleHandler}
        />
        {card}
      </div>
    </>
  )
})
