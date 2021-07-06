import { FC, useEffect, useState } from 'react'
import Countdown from 'react-countdown'
import stylesModule from './DateNightCountdown.module.scss'
import AnimatedNumber from 'react-animated-numbers'

interface DateNightCountdownProps {
  timeTilNextDateNight: number
}

const zero = (num: number) => (num < 10 ? <span>0</span> : '')
interface CountdownNumberProps {
  num: number
}

const CountdownNumber: FC<CountdownNumberProps> = ({ num }) => {
  const [disabled, setDisabled] = useState(true)
  useEffect(() => {
    setTimeout(() => {
      setDisabled(false)
    }, 0)
  })

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
  const dateNight = Date.now() + timeTilNextDateNight

  return (
    <>
      <Countdown
        date={dateNight}
        renderer={({ seconds, minutes, hours, days }) => {
          return (
            <div className={stylesModule.countdownContainer}>
              <div className={stylesModule.box}>
                <CountdownNumber num={days} />
              </div>
              <div className={stylesModule.box}>
                <CountdownNumber num={hours} />
              </div>
              <div className={stylesModule.box}>
                <CountdownNumber num={minutes} />
              </div>
              <div className={stylesModule.box}>
                <CountdownNumber num={seconds} />
              </div>
            </div>
          )
        }}
      />
    </>
  )
}
