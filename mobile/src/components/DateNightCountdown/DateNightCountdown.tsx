import { FC, useEffect, useMemo, useState } from 'react'
import Countdown from 'react-countdown'
import stylesModule from './DateNightCountdown.module.scss'
import AnimatedNumber from 'react-animated-numbers'
import { useLocation } from 'react-router'
interface DateNightCountdownProps {
  timeTilNextDateNight: number
}

const zero = (num: number) => (num < 10 ? <span>0</span> : '')

interface CountdownNumberProps {
  num: number
  disabled: boolean
}

const CountdownNumber: FC<CountdownNumberProps> = ({ num, disabled }) => {
  if (disabled) return <>00</>

  return (
    <>
      {zero(num)}
      <AnimatedNumber animationType="calm" animateToNumber={num} />
    </>
  )
}

export const DateNightCountdown: FC<DateNightCountdownProps> = ({
  timeTilNextDateNight
}) => {
  const [disabled, setDisable] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/waitingroom') setDisable(false)
    else setDisable(true)
  }, [location])

  const dateNight = useMemo(
    () => Date.now() + timeTilNextDateNight,
    [timeTilNextDateNight]
  )

  return (
    <Countdown
      date={dateNight}
      renderer={({ seconds, minutes, hours, days }) => {
        return (
          <div className={stylesModule.countdownContainer}>
            <div className={stylesModule.box}>
              <CountdownNumber num={days} disabled={disabled} />
            </div>
            <div className={stylesModule.box}>
              <CountdownNumber num={hours} disabled={disabled} />
            </div>
            <div className={stylesModule.box}>
              <CountdownNumber num={minutes} disabled={disabled} />
            </div>
            <div className={stylesModule.box}>
              <CountdownNumber num={seconds} disabled={disabled} />
            </div>
          </div>
        )
      }}
    />
  )
}
