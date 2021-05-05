import { useCallback, useState } from 'react'
import { Card } from '../../components/Card'
import { Toggle } from '../../components/Toggle'
import commonStyles from '../Common.module.scss'
import moduleStyles from './WaitingRoom.module.scss'
import { AppBarHeader } from '../../components/AppBarHeader'
import { classes } from '../../utils'
import { observer } from 'mobx-react-lite'
import user from '../../store/user'
import date from '../../store/meetup'
import app from '../../store/app'
import { PARAMS } from '../../store/utils/constants'
import { UserCard } from '../../store/utils/types'

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
      await date.shiftCards()
      setDisabled(false)
    } catch {
      setDisabled(false)
    }
  }, [disabled])
  const rejectHandler = useCallback(async () => {
    if (disabled) return console.log('action button disabled')
    try {
      setDisabled(true)
      await date.shiftCards(true)
      setDisabled(false)
    } catch {
      setDisabled(false)
    }
  }, [disabled, setDisabled])

  const getType = (card: UserCard) => {
    if (card.isDate) return user.here ? 'join' : 'invite'
    else return user.here ? 'invite' : 'like'
  }

  const topCard = date.cards.length > 0 && date.cards[0]

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

  return (
    <>
      <AppBarHeader />
      <div className={classes(commonStyles.container, moduleStyles.container)}>
        <Toggle
          className={moduleStyles.toggle}
          toggleMessages={{
            on: app.params[PARAMS.WANT_TO_GO_ON_DATES],
            off: app.params[PARAMS.DONT_WANT_TO_GO_ON_DATES]
          }}
          toggled={user.here}
          onToggle={toggleHandler}
        />
        {card}
      </div>
    </>
  )
})
