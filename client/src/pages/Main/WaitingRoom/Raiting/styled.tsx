import styled from 'styled-components'
import { WaitingContainer } from '../styled'

export const RaitingWrapper = styled(WaitingContainer)`
  justify-content: space-around;
  font-size: 1.4rem;
  > div {
    text-align: center;
    padding: 0 5px;
  }
  box-sizing: border-box;
`

export const AppreciateButtons = styled.div`
  display: flex;
  justify-content: space-around;
  width: 80%;
  height: 200px;
  flex-wrap: wrap;
`

export const ModalWrapper = styled(RaitingWrapper)`
  justify-content: flex-start !important;
  padding-top: 50px;
  font-size: 2rem;
`

export const ButtonsWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-evenly;
  margin-top: 30px;
  box-sizing: border-box;
  button {
    width: 40%;
  }
`

export const DoneButton = styled.button`
  background: white;
  color: black;
  border-radius: 4px;
  width: 80%;
  border: none;
  text-transform: uppercase;
  font-weight: bold;
  padding: 10px;
  transition: 0.3s;
  &:active {
    opacity: 0.6;
  }
`
