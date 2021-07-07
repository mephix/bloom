import { ButtonToggle } from 'components/ButtonToggle'
import { HeartToggle } from 'components/HeartToggle'
import { useCallback, useContext, useEffect, useState } from 'react'
import { TabContext } from 'routes/MainRoutes/TabContext'
import { MeetupService, RateToggles } from 'services/meetup.service'
import { UserService } from 'services/user.service'
import { useAppDispatch, useAppSelector } from 'store'
import { setAppState } from 'store/app'
import { selectCurrentDate } from 'store/meetup'
import { RaitingModal } from './RaitingModal'
import { AppreciateButtons, DoneButton, RaitingWrapper } from './styled'

export const Raiting = () => {
  const dispatch = useAppDispatch()
  const currentDate = useAppSelector(selectCurrentDate)

  const { showTabs } = useContext(TabContext)
  const [rate, setRate] = useState<Record<RateToggles, boolean>>({
    fun: false,
    curious: false,
    outgoing: false,
    interesting: false,
    creative: false,
    goodListener: false,
    asksInterestingQuestions: false,
    heart: false
  })
  const [modal, setModal] = useState(false)

  useEffect(() => {
    showTabs()
  }, [showTabs])

  const doneRaitingHandler = useCallback(() => {
    MeetupService.setRaiting(rate)
    console.log(rate)
    setModal(true)
  }, [rate, setModal])

  const setRateValue = useCallback(
    (value: string, state: boolean) => {
      setRate({
        ...rate,
        [value]: state
      })
    },
    [setRate, rate]
  )

  const modalHandler = useCallback(
    state => {
      UserService.setFree(true)
      UserService.setHere(state)
      dispatch(setAppState('WAITING'))
    },
    [dispatch]
  )

  if (modal) return <RaitingModal modalHandler={modalHandler} />

  return (
    <RaitingWrapper>
      <div>Time's up!</div>
      <div>How would you describe {currentDate?.firstName}?</div>
      <AppreciateButtons>
        <ButtonToggle onToggle={setRateValue} title="fun" value="fun" />
        <ButtonToggle onToggle={setRateValue} title="curious" value="curious" />
        <ButtonToggle
          onToggle={setRateValue}
          title="outgoing"
          value="outgoing"
        />
        <ButtonToggle
          onToggle={setRateValue}
          title="interesting"
          value="interesting"
        />
        <ButtonToggle
          onToggle={setRateValue}
          title="good listener"
          value="goodListener"
        />
        <ButtonToggle
          onToggle={setRateValue}
          title="creative"
          value="creative"
        />
        <ButtonToggle
          onToggle={setRateValue}
          title="asks interesting questions"
          value="asksInterestingQuestions"
        />
      </AppreciateButtons>

      <div>Do you want to exchange numbers with {currentDate?.firstName}?</div>
      <div>
        <HeartToggle onToggle={state => setRate({ ...rate, heart: state })} />
      </div>
      <DoneButton onClick={doneRaitingHandler}>Done</DoneButton>
    </RaitingWrapper>
  )
}
