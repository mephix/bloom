import { FC, useCallback, useEffect } from 'react'
// import { CountDownProps } from './CountDown.type'
import { CountDownBox } from './CountDownBox'
import commonStyles from '../Common.module.scss'
import moduleStyles from './CountDown.module.scss'
import { classes } from '../../utils'
import user from '../../store/user'
import app from '../../store/app'
import meetup from '../../store/meetup'

export const CountDown: FC = () => {
  const onComplete = useCallback(() => {
    if (!meetup.currentMatchingUserData) return app.setWaitingRoomState()
    if (!meetup.currentMatchingUserData?.here) app.setWaitingRoomState()
    else {
      user.setFree(false)
      app.setVideoState()
    }
  }, [])

  useEffect(() => {
    if (!meetup.currentMatchingUserData) {
      console.error('Not matching user!')
      meetup.resetMatchingUser()
      return app.setWaitingRoomState()
    }
  })

  return (
    <div className={classes(commonStyles.container, moduleStyles.container)}>
      <CountDownBox onComplete={onComplete} />
      <div className={moduleStyles.info}>you have a date with...</div>
      <div className={moduleStyles.userInfo}>
        <div className={moduleStyles.name}>
          {meetup.currentMatchingUserData?.firstName}
        </div>
        <div className={classes(moduleStyles.bio, moduleStyles.info)}>
          {meetup.currentMatchingUserData?.bio}
        </div>
      </div>
    </div>
  )
}
