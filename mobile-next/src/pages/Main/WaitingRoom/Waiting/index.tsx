import { useAppSelector } from 'store'
import { selectAppParams } from 'store/app'
import { DateNightCountdown } from './DateNightCountdown'
import { WaitingRoomContainer } from './styled'

export const Waiting = () => {
  const params = useAppSelector(selectAppParams)
  const timeTilNextDateNight = 1000 * 60 * 60 * 24 * 5

  return (
    <WaitingRoomContainer>
      <div>{params.WAITING_FOR_DATE_NIGTH}</div>
      <DateNightCountdown timeTilNextDateNight={timeTilNextDateNight} />
    </WaitingRoomContainer>
  )
}
