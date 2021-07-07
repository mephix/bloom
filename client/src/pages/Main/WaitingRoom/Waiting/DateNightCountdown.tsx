import { FC, useEffect, useState } from 'react'
import Countdown from 'react-countdown'
import AnimatedNumber from 'react-animated-numbers'
import { CountdownBox, CountdownContainer } from './styled'

interface DateNightCountdownProps {
  timeTilNextDateNight: number
  onDateNightStart: () => void
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
  timeTilNextDateNight,
  onDateNightStart
}) => {
  const dateNight = Date.now() + timeTilNextDateNight

  return (
    <>
      <Countdown
        date={dateNight}
        onComplete={onDateNightStart}
        renderer={({ seconds, minutes, hours, days }) => {
          return (
            <CountdownContainer>
              <CountdownBox>
                <CountdownNumber num={days} />
              </CountdownBox>
              <CountdownBox>
                <CountdownNumber num={hours} />
              </CountdownBox>
              <CountdownBox>
                <CountdownNumber num={minutes} />
              </CountdownBox>
              <CountdownBox>
                <CountdownNumber num={seconds} />
              </CountdownBox>
            </CountdownContainer>
          )
        }}
      />
    </>
  )
}
