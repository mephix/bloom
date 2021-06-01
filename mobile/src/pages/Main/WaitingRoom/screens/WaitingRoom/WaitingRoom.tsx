import { useCallback, useEffect, useState } from 'react'
import { Card } from 'components/Card'
import { Toggle } from 'components/Toggle'
import commonStyles from '../Common.module.scss'
import moduleStyles from './WaitingRoom.module.scss'
import { classes } from 'utils/common'
import { observer } from 'mobx-react-lite'
import user from 'state/user'
import app from 'state/app'
import { PARAMS } from 'state/utils/constants'
import { UserCard } from 'state/utils/types'
import meetup from 'state/meetup'
import placeholderImage from 'assets/images/placeholder.jpg'

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
    meetup.checkAvailability(() => app.setVideoState())
  }, [])

  const topCard = meetup.cards.length > 0 && meetup.cards[0]

  const card = topCard ? (
    <Card
      type={getType(topCard)}
      user={{
        avatar: topCard.face
          ? `${topCard.face}${app.faceDisplay}`
          : placeholderImage,
        name: topCard.firstName,
        bio: topCard.bio
      }}
      onResolve={resolveHandler}
      onReject={rejectHandler}
    />
  ) : (
    user.here && <div>{app.params[PARAMS.SETTING_YOU_UP]}</div>
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

  const content = meetup.isDateNight ? (
    <>
      {toggle}
      {card}
    </>
  ) : (
    <div>{app.params[PARAMS.WAITING_FOR_DATE_NIGTH]}</div>
  )

  return (
    <div className={classes(commonStyles.container, moduleStyles.container)}>
      {content}
    </div>
  )
})
