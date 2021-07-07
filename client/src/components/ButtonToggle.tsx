import { FC, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { noop } from '../utils'

export interface ButtonToggleProps {
  title?: string
  value: string
  onToggle: (value: string, state: boolean) => void
  toggled?: boolean
}

const Container = styled.label`
  cursor: pointer;
  margin: 5px;
  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  span {
    background-color: white;
    color: black;
    padding: 5px;
    font-size: 1.6rem;
    border-radius: 4px;
  }

  input:checked ~ span {
    color: #25d8b2;
  }
`

export const ButtonToggle: FC<ButtonToggleProps> = ({
  title,
  toggled = false,
  onToggle = noop,
  value
}) => {
  const [state, setState] = useState(toggled)

  useEffect(() => {
    setState(toggled)
  }, [toggled, setState])

  const changeHandler = useCallback(
    ({ target: { checked } }) => {
      setState(checked)
      onToggle(value, checked)
    },
    [setState, onToggle, value]
  )
  return (
    <>
      <Container>
        <input checked={state} onChange={changeHandler} type="checkbox" />
        <span>{title}</span>
      </Container>
    </>
  )
}
