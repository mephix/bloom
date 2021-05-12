import { FC, useCallback, useEffect } from 'react'
// import { CountDownProps } from './CountDown.type'
import { CountDownBox } from './CountDownBox'
import commonStyles from '../Common.module.scss'
import moduleStyles from './CountDown.module.scss'
import { classes } from '../../utils/common'
import user from '../../store/user'
import app from '../../store/app'
import meetup from '../../store/meetup'

export const CountDown: FC = () => {
  const onComplete = useCallback(() => {
    // meetup.checkAvailabilityAfterCountDown
    if (!user.hiddenHere) return app.resetCountDown()
    if (!meetup.currentMatchingUserData) return app.resetCountDown()
    if (!meetup.currentMatchingUserData?.here) return app.resetCountDown()
    if (meetup.currentMatchingUserData?.dateWith !== user.email)
      return app.resetCountDown()
    else {
      user.setFree(false)
      app.setVideoState()
    }
  }, [])

  useEffect(() => {
    if (!meetup.currentMatchingUserData) {
      console.error('Not matching user!')
      return app.resetCountDown()
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
