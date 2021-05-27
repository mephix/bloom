import { FC } from 'react'
import Countdown from 'react-countdown'
import { noop } from 'utils/common'
import moduleStyles from './CountDown.module.scss'
import { CountDownBoxProps } from './CountDown.type'

export const CountDownBox: FC<CountDownBoxProps> = ({
  onComplete = noop,
  timeout
}) => {
  return (
    <div className={moduleStyles.countDownBox}>
      <Countdown
        date={timeout}
        renderer={({ formatted }) => <>{formatted.seconds}</>}
        onComplete={() => onComplete()}
      />
    </div>
  )
}
