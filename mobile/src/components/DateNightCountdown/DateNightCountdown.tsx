import { FC } from 'react'
import Countdown from 'react-countdown'
import stylesModule from './DateNightCountdown.module.scss'

interface DateNightCountdownProps {
  timeTilNextDateNight: number
}

export const DateNightCountdown: FC<DateNightCountdownProps> = ({
  timeTilNextDateNight
}) => {
  const dateNight = Date.now() + timeTilNextDateNight
  return (
    <Countdown
      date={dateNight}
      renderer={({ formatted: { seconds, minutes, hours, days } }) => {
        return (
          <div className={stylesModule.countdownContainer}>
            <div className={stylesModule.box}>{days}</div>
            <div className={stylesModule.box}>{hours}</div>
            <div className={stylesModule.box}>{minutes}</div>
            <div className={stylesModule.box}>{seconds}</div>
          </div>
        )
      }}
    />
  )
}
