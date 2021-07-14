import { Card } from 'components/Card'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { MeetupService } from 'services/meetup.service'
import { UserService } from 'services/user.service'
import { useAppDispatch, useAppSelector } from 'store'
import { selectAppParams } from 'store/app'
import {
  selectIsDateNight,
  selectTimeTilDateNight,
  startDateNight
} from 'store/meetup'
import { CardType } from 'store/meetup/types'
import { selectFinished, selectUserHere } from 'store/user'
import { DateNightCountdown } from './DateNightCountdown'
import { StyledToggle, WaitingRoomContainer, FinishedWrapper } from './styled'
import { useTopCard } from './utils'
import Linkify from 'react-linkify'

// const isDateNight = true

export const Waiting = () => {
  const dispatch = useAppDispatch()
  const params = useAppSelector(selectAppParams)
  const here = useAppSelector(selectUserHere)
  const finished = useAppSelector(selectFinished)
  const isDateNight = useAppSelector(selectIsDateNight)
  const timeTilNextDateNight = useAppSelector(selectTimeTilDateNight)
  const topCard = useTopCard()
  const [delayed, setDelayed] = useState(false)
  const cardType = useMemo(() => {
    if (!topCard) return
    if (topCard.type === CardType.Date) return here ? 'join' : 'join'
    else return here ? 'invite' : 'like'
  }, [topCard, here])

  useEffect(() => {
    UserService.setWaitStartTime()
  }, [])

  const toggleHandler = useCallback(state => UserService.setHere(state), [])

  const selectHandler = useCallback(
    async (choice: boolean) => {
      if (delayed) return
      if (!topCard) return
      setDelayed(true)
      if (topCard.type === CardType.Date) {
        MeetupService.acceptDate(topCard.dateId!, choice)
        if (choice) UserService.setHere(true)
        return setDelayed(false)
      }
      await MeetupService.moveProspect(choice, here)
      setDelayed(false)
    },
    [delayed, topCard, here]
  )

  const cardContent = useMemo(() => {
    if (topCard)
      return (
        <Card
          type={cardType!}
          user={{
            avatar: topCard.avatar,
            name: topCard.firstName,
            bio: topCard.bio
          }}
          onResolve={() => selectHandler(true)}
          onReject={() => selectHandler(false)}
        />
      )
    else return here && <div>{params.SETTING_YOU_UP}</div>
  }, [topCard, cardType, here, params, selectHandler])

  const toggle = useMemo(() => {
    if (!finished)
      return (
        <StyledToggle
          toggleMessages={{
            on: params.WANT_TO_GO_ON_DATES,
            off: params.DONT_WANT_TO_GO_ON_DATES
          }}
          toggled={here}
          onToggle={toggleHandler}
        />
      )
    else
      return (
        <FinishedWrapper>
          <Linkify
            componentDecorator={(decoratedHref, decoratedText, key) => (
              <a target="blank" href={decoratedHref} key={key}>
                {decoratedText}
              </a>
            )}
          >
            {params.FINISHED}
          </Linkify>
        </FinishedWrapper>
      )
  }, [params, here, toggleHandler, finished])

  const content = useMemo(() => {
    if (isDateNight)
      return (
        <>
          {toggle}
          {cardContent}
        </>
      )
    else
      return (
        <>
          <div>{params.NOT_DATE_NIGHT}</div>
          <DateNightCountdown
            onDateNightStart={() => dispatch(startDateNight())}
            timeTilNextDateNight={timeTilNextDateNight}
          />
        </>
      )
  }, [timeTilNextDateNight, params, cardContent, toggle, isDateNight, dispatch])

  return <WaitingRoomContainer>{content}</WaitingRoomContainer>
}
