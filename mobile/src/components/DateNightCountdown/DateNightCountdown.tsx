import { FC } from 'react'
import Countdown from 'react-countdown'
import stylesModule from './DateNightCountdown.module.scss'
import AnimatedNumber from 'react-animated-numbers'
interface DateNightCountdownProps {
  timeTilNextDateNight: number
}

const zero = (num: number) => (num < 10 ? <span>0</span> : '')

export const DateNightCountdown: FC<DateNightCountdownProps> = ({
  timeTilNextDateNight
}) => {
  const dateNight = Date.now() + timeTilNextDateNight
  return (
    <Countdown
      date={dateNight}
      renderer={({ seconds, minutes, hours, days }) => {
        return (
          <div className={stylesModule.countdownContainer}>
            <div className={stylesModule.box}>
              {zero(days)}
              <AnimatedNumber
                animationType="calm"
                animateToNumber={days}
              />{' '}
            </div>
            <div className={stylesModule.box}>
              {zero(hours)}
              <AnimatedNumber animationType="calm" animateToNumber={hours} />
            </div>
            <div className={stylesModule.box}>
              {zero(minutes)}
              <AnimatedNumber animationType="calm" animateToNumber={minutes} />
            </div>
            <div className={stylesModule.box}>
              {zero(seconds)}
              <AnimatedNumber animationType="calm" animateToNumber={seconds} />
            </div>
          </div>
        )
      }}
    />
  )
}
