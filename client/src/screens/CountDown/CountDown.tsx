import { FC } from 'react'
import { CountDownProps } from './CountDown.type'
import { CountDownBox } from './CountDownBox'
import commonStyles from '../Common.module.scss'
import moduleStyles from './CountDown.module.scss'
import { classes, noop } from '../../utils'

export const CountDown: FC<CountDownProps> = ({ user, onComplete = noop }) => {
  return (
    <div className={commonStyles.container}>
      <CountDownBox onComplete={onComplete} />
      <div className={moduleStyles.info}>you have a date with...</div>
      <div className={moduleStyles.userInfo}>
        <div className={moduleStyles.name}>{user.name}</div>
        <div className={classes(moduleStyles.bio, moduleStyles.info)}>
          {user.bio}
        </div>
      </div>
    </div>
  )
}
