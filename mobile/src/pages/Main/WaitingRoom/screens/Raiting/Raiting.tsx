import { useCallback, useState } from 'react'
import { ButtonToggle } from 'components/ButtonToggle'
import { IconToggle } from 'components/IconToggle'
import app from 'state/app'
import meetup from 'state/meetup'
import user from 'state/user'
import { classes } from 'utils/common'
import commonStyles from '../Common.module.scss'
import moduleStyles from './Raiting.module.scss'
import { RateToggles } from 'state/utils/types'

export const Raiting = () => {
  const [rate, setRate] = useState<{ [key in RateToggles]: boolean }>({
    fun: false,
    curious: false,
    outgoing: false,
    interesting: false,
    creative: false,
    goodListener: false,
    asksInterestingQuestion: false,
    heart: false
  })
  const [modal, setModal] = useState(false)

  const doneRaitingHandler = useCallback(() => {
    meetup.setRaiting(rate)
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

  const modalHandler = useCallback(state => {
    user.setHere(state)
    user.setFree(true)
    app.setWaitingRoomState()
  }, [])

  if (modal)
    return (
      <div
        className={classes(
          commonStyles.container,
          moduleStyles.container,
          moduleStyles.modal
        )}
      >
        <div>Do you want to go on another date?</div>
        <div className={moduleStyles.buttons}>
          <button
            onClick={() => modalHandler(true)}
            className={moduleStyles.done}
          >
            yes
          </button>
          <button
            onClick={() => modalHandler(false)}
            className={moduleStyles.done}
          >
            no
          </button>
        </div>
      </div>
    )

  return (
    <div className={classes(commonStyles.container, moduleStyles.container)}>
      <div>Time's up!</div>
      <div>
        How would you describe {meetup.currentMatchingUserData?.firstName}?
      </div>
      <div className={moduleStyles.appreciateButtons}>
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
          title="asks interesting question"
          value="asksInterestingQuestion"
        />
      </div>
      <div>
        Do you want to exchange numbers with{' '}
        {meetup.currentMatchingUserData?.firstName}?
      </div>
      <div>
        <IconToggle
          onToggle={state => setRate({ ...rate, heart: state })}
          type="heart"
        />
      </div>
      <button onClick={doneRaitingHandler} className={moduleStyles.done}>
        Done
      </button>
    </div>
  )
}
