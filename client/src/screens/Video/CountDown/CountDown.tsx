import { FC } from 'react'
// import { CountDownProps } from './CountDown.type'
import { CountDownBox } from './CountDownBox'
import commonStyles from '../../Common.module.scss'
import moduleStyles from './CountDown.module.scss'
import { classes, noop } from '../../../utils/common'
import { CountDownProps } from './CountDown.type'

export const CountDown: FC<CountDownProps> = ({
  onComplete = noop,
  firstName,
  bio,
  timeout
}) => {
  return (
    <div className={classes(commonStyles.container, moduleStyles.container)}>
      <CountDownBox timeout={timeout} onComplete={onComplete} />
      <div className={moduleStyles.info}>you have a date with...</div>
      <div className={moduleStyles.userInfo}>
        <div className={moduleStyles.name}>{firstName}</div>
        <div className={classes(moduleStyles.bio, moduleStyles.info)}>
          {bio}
        </div>
      </div>
    </div>
  )
}
