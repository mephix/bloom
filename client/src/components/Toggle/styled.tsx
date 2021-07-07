import styled from 'styled-components'

export const ToggleWrapper = styled.div`
  margin: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
`

export const SwitchLabel = styled.label`
  position: relative;
  display: inline-block;
  width: 70px;
  min-height: 34px;
  height: 34px;
  margin-bottom: 5px;
  input {
    opacity: 0;
    width: 0;
    height: 0;
    outline: none;

    &:checked + span {
      background-color: #8ac350;
    }
    &:checked + span:before {
      transform: translateX(36px);
    }
  }
`
export const SliderSpan = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #808281;
  /* background-color: red; */
  transition: 0.4s;
  border-radius: 34px;
  &::before {
    position: absolute;
    content: '';
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`
