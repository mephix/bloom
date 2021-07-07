import { FC } from 'react'
import Countdown from 'react-countdown'
import { noop } from 'utils/common'
import { CountDownBoxProps } from './types'
import { CountDownBoxWrapper } from '../styled'

export const CountDownBox: FC<CountDownBoxProps> = ({
  onComplete = noop,
  timeout
}) => {
  return (
    <CountDownBoxWrapper>
      <Countdown
        date={timeout}
        renderer={({ formatted }) => <>{formatted.seconds}</>}
        onComplete={() => onComplete()}
      />
    </CountDownBoxWrapper>
  )
}
