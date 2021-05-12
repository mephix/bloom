import { useState, useEffect, useCallback, FC } from 'react'
import { ToggleProps } from './Toggle.type'
import { classes, noop } from '../../utils/common'
import stylesModule from './Toggle.module.scss'

export const Toggle: FC<ToggleProps> = ({
  toggled = false,
  toggleMessages = { on: 'on', off: 'off' },
  onToggle = noop,
  className = ''
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
    <div className={classes(stylesModule.toggleWrapper, className)}>
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
