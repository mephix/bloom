import { FC, useCallback, useEffect, useState } from 'react'
import { noop } from 'utils'
import { SliderSpan, SwitchLabel, ToggleWrapper } from './styled'

export interface ToggleProps {
  toggled?: boolean
  toggleMessages?: {
    on: string
    off: string
  }
  onToggle?: (state: boolean) => void
}

export const Toggle: FC<ToggleProps> = ({
  toggled = false,
  toggleMessages = { on: 'on', off: 'off' },
  onToggle = noop
}) => {
  const [state, setState] = useState(toggled)

  useEffect(() => {
    setState(toggled)
  }, [toggled, setState])

  const changeHandler = useCallback(
    ({ target: { checked } }) => {
      setState(checked)
      onToggle(checked)
    },
    [setState, onToggle]
  )

  return (
    <ToggleWrapper>
      <SwitchLabel>
        <input
          value={state.toString()}
          checked={state}
          onChange={changeHandler}
          type="checkbox"
        />
        <SliderSpan />
      </SwitchLabel>
      <span>{state ? toggleMessages.on : toggleMessages.off}</span>
    </ToggleWrapper>
  )
}
