import { Toggle } from 'components/Toggle'
import styled from 'styled-components'
import { WaitingContainer } from '../styled'

export const WaitingRoomContainer = styled(WaitingContainer)`
  height: 100%;

  > div {
    text-align: center;
    padding: 0 20px;
    box-sizing: border-box;
  }
`
export const CountdownContainer = styled.div`
  display: flex;
  margin: 20px;
`

export const CountdownBox = styled.div`
  font-size: 1.6rem;
  display: flex;
  margin: 0 10px;
  padding: 10px;
  border: 2px solid white;
  border-radius: 5px;
`
export const StyledToggle = styled(Toggle)`
  margin: 20px 0;
`

export const FinishedWrapper = styled.div`
  font-size: 1.5rem;
  margin: 10px 0;
  a {
    color: #cfb9ff;
  }
`
