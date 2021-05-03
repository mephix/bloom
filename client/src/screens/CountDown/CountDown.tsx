import { FC, useCallback } from 'react'
// import { CountDownProps } from './CountDown.type'
import { CountDownBox } from './CountDownBox'
import commonStyles from '../Common.module.scss'
import moduleStyles from './CountDown.module.scss'
import { classes } from '../../utils'
import user from '../../store/user'
import app from '../../store/app'

export const CountDown: FC = () => {
  const onComplete = useCallback(() => {
    if (!user.matchingUser?.here) app.setWaitingRoomState()
    else {
      user.setFree(false)
      app.setVideoState()
    }
  }, [])

  return (
    <div className={classes(commonStyles.container, moduleStyles.container)}>
      <CountDownBox onComplete={onComplete} />
      <div className={moduleStyles.info}>you have a date with...</div>
      <div className={moduleStyles.userInfo}>
        <div className={moduleStyles.name}>{user.matchingUser?.firstName}</div>
        <div className={classes(moduleStyles.bio, moduleStyles.info)}>
          {user.matchingUser?.bio}
        </div>
      </div>
    </div>
  )
}
