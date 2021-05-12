import { useCallback, useState } from 'react'
import { IconToggle } from '../../components/IconToggle'
import app from '../../store/app'
import meetup from '../../store/meetup'
import user from '../../store/user'
import { classes } from '../../utils/common'
import commonStyles from '../Common.module.scss'
import moduleStyles from './Raiting.module.scss'

export const Raiting = () => {
  const [rate, setRate] = useState({
    fun: false,
    heart: false
  })
  const [modal, setModal] = useState(false)

  const doneRaitingHandler = useCallback(() => {
    meetup.setRaiting(rate.fun, rate.heart)
    setModal(true)
  }, [rate, setModal])

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
        Could you and {meetup.currentMatchingUserData?.firstName} see and hear
        each other ok?
      </div>
      <div>
        <IconToggle
          onToggle={state => setRate({ ...rate, fun: state })}
          type="dislike"
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
