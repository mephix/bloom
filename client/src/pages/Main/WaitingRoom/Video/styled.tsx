import styled from 'styled-components'
import { WaitingContainer } from '../styled'
import hiddenIcon from 'assets/images/icons/hidden.svg'

export const CountDownContainer = styled(WaitingContainer)`
  justify-content: flex-start;
  position: fixed;
  z-index: 10;
`
export const CountDownInfo = styled.div`
  color: #c8c8c8;
`

export const CountDownUserInfo = styled.div`
  margin-top: 30px;
`

export const CountDownName = styled.div`
  font-size: 1.3rem;
  text-align: center;
  margin: 10px 0;
`

export const CountDownBio = styled(CountDownInfo)`
  padding: 0 30px;
  font-size: 0.9rem;
`

export const CountDownBoxWrapper = styled.div`
  border: 2px solid #363636;
  border-radius: 4px;
  font-size: 2rem;
  padding: 15px;
  margin-top: 50px;
  margin-bottom: 30px;
`

export const VideoFrame = styled.iframe`
  height: calc(100% - 50px - 60px);
  box-sizing: border-box;
  border: none;
  width: 100%;
`

export const VideoHeader = styled.header`
  height: 50px;
  display: flex;
  align-items: center;
  background: black;
`

export const BlindContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 50px;
  height: calc(100% - 50px - 60px - 66px);
  /* background: url(${hiddenIcon}) no-repeat center center / 100px, black; */
`

export const BlindTitle = styled.div`
  color: white;
  font-size: 2rem;
  margin-top: 150px;
  text-align: center;
`
export const BlindText = styled.div`
  color: #a3a3a3;
  margin-top: 10px;
  padding: 0 30px;
  text-align: center;
`

export const FirstNameSpan = styled.div`
  margin-left: 10px;
`

export const LeaveVideoButton = styled.button`
  background-color: #feafb0;
  border: none;
  width: 100%;
  height: 60px;
  text-transform: uppercase;
  font-weight: bold;
  transition: 0.2s ease-in-out;
  margin-top: -4px;

  &:active {
    background-color: #f59799;
  }
`

export const FadeScreen = styled.div`
  background-color: black;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`
