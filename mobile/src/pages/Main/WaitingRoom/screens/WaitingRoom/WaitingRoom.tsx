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
import { DateNightCountdown } from 'components/DateNightCountdown'
import { DateClockService } from 'services/dateClock.service'
import { useLocation } from 'react-router'

export const WaitingRoom = observer(() => {
  const toggleHandler = useCallback(state => user.setHere(state), [])
  const [timeTilNextDateNight, setTimeTilNextDateNight] = useState(
    DateClockService.timeTilNextDateNight()
  )
  const [disabled, setDisabledCountdown] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/waitingroom') setDisabledCountdown(false)
    else {
      setTimeTilNextDateNight(DateClockService.timeTilNextDateNight())
      setDisabledCountdown(true)
    }
  }, [location])

  const resolveHandler = useCallback(() => {
    if (!meetup.updatingProspects) meetup.shiftCards()
  }, [])
  const rejectHandler = useCallback(() => {
    if (!meetup.updatingProspects) meetup.shiftCards(true)
  }, [])

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
        avatar: topCard.avatar ? topCard.avatar : placeholderImage,
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
    <>
      <div>{app.params[PARAMS.WAITING_FOR_DATE_NIGTH]}</div>
      {!disabled && (
        <DateNightCountdown timeTilNextDateNight={timeTilNextDateNight} />
      )}
    </>
  )

  return (
    <div className={classes(commonStyles.container, moduleStyles.container)}>
      {content}
    </div>
  )
})
