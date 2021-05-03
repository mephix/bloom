import { useCallback, useState } from 'react'
import { IconToggle } from '../../components/IconToggle'
import app from '../../store/app'
import user from '../../store/user'
import { classes } from '../../utils'
import commonStyles from '../Common.module.scss'
import moduleStyles from './Raiting.module.scss'

export const Raiting = () => {
  const [rate, setRate] = useState({
    quality: false,
    exchange: false,
  })
  const [modal, setModal] = useState(false)

  const doneRaitingHandler = useCallback(() => {
    console.log(rate)
    setModal(true)
  }, [rate, setModal])

  const modalHandler = useCallback(state => {
    user.setHere(state)
    user.setFree(true)
    user.resetMatchingUser()
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
        Could you and {user.matchingUser?.firstName} see and hear each other ok?
      </div>
      <div>
        <IconToggle
          onToggle={state => setRate({ ...rate, quality: state })}
          type="dislike"
        />
      </div>
      <div>
        Do you want to exchange numbers with {user.matchingUser?.firstName}?
      </div>
      <div>
        <IconToggle
          onToggle={state => setRate({ ...rate, exchange: state })}
          type="heart"
        />
      </div>
      <button onClick={doneRaitingHandler} className={moduleStyles.done}>
        Done
      </button>
    </div>
  )
}
