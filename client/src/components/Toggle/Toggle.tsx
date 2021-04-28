import { useState, useEffect, useCallback } from 'react'
import stylesModule from './Toggle.module.scss'

const noop = () => {}

export type ToggleProps = {
  toggled: boolean
  toggleMessages: {
    on: string
    off: string
  }
  onToggle: (state: boolean) => void
}

export const Toggle = ({
  toggled = false,
  toggleMessages = { on: 'on', off: 'off' },
  onToggle = noop
}: ToggleProps) => {
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
    <div className={stylesModule.toggleWrapper}>
      <label className={stylesModule.switch}>
        <input
          value={state.toString()}
          checked={state}
          onChange={changeHandler}
          type="checkbox"
        />
        <span className={stylesModule.slider} />
      </label>
      <span>{state ? toggleMessages.on : toggleMessages.off}</span>
    </div>
  )
}
