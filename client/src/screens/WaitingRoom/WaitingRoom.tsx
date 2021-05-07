import { useCallback, useEffect, useState } from 'react'
import { Card } from '../../components/Card'
import { Toggle } from '../../components/Toggle'
import commonStyles from '../Common.module.scss'
import moduleStyles from './WaitingRoom.module.scss'
import { AppBarHeader } from '../../components/AppBarHeader'
import { classes } from '../../utils'
import { observer } from 'mobx-react-lite'
import user from '../../store/user'
import app from '../../store/app'
import { PARAMS } from '../../store/utils/constants'
import { UserCard } from '../../store/utils/types'
import meetup from '../../store/meetup'

const mockUser = {
  avatar: '/docs/placeholder.jpg',
  name: 'Name',
  bio: 'this is a bio \n can have multiple lines'
}

export const WaitingRoom = observer(() => {
  const toggleHandler = useCallback(state => user.setHere(state), [])
  const [disabled, setDisabled] = useState<boolean>(false)

  const resolveHandler = useCallback(async () => {
    if (disabled) return console.log('action button disabled')
    try {
      setDisabled(true)
      await meetup.shiftCards()
      setDisabled(false)
    } catch {
      setDisabled(false)
    }
  }, [disabled])
  const rejectHandler = useCallback(async () => {
    if (disabled) return console.log('action button disabled')
    try {
      setDisabled(true)
      await meetup.shiftCards(true)
      setDisabled(false)
    } catch {
      setDisabled(false)
    }
  }, [disabled, setDisabled])

  const getType = (card: UserCard) => {
    if (card.isDate) return user.here ? 'join' : 'join'
    else return user.here ? 'invite' : 'like'
  }

  useEffect(() => {
    user.setWaitStartTime()
    meetup.checkAvailability(() => app.setCountDownState())
  }, [])

  const topCard = meetup.cards.length > 0 && meetup.cards[0]

  const card = topCard ? (
    <Card
      type={getType(topCard)}
      user={{
        avatar: mockUser.avatar,
        name: topCard.firstName,
        bio: topCard.bio
      }}
      onResolve={resolveHandler}
      onReject={rejectHandler}
    />
  ) : (
    <div>{app.params[PARAMS.SETTING_YOU_UP]}</div>
  )

  const toggle = !user.finished ? (
    <Toggle
      className={moduleStyles.toggle}
      toggleMessages={{
        on: app.params[PARAMS.WANT_TO_GO_ON_DATES],
        off: app.params[PARAMS.DONT_WANT_TO_GO_ON_DATES]
      }}
      toggled={user.here}
      onToggle={toggleHandler}
    />
  ) : (
    <div className={moduleStyles.finished}>{app.params[PARAMS.FINISHED]}</div>
  )

  return (
    <>
      <AppBarHeader />
      <div className={classes(commonStyles.container, moduleStyles.container)}>
        {toggle}
        {card}
      </div>
    </>
  )
})
