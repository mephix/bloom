import { FC, useCallback, useEffect, useState } from 'react'
import { ButtonToggleProps } from './ButtonToggle.type'
import stylesModule from './ButtonToggle.module.scss'
import { noop } from '../../utils'

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
      <label className={stylesModule.container}>
        <input checked={state} onChange={changeHandler} type="checkbox" />
        <span className={stylesModule.button}>{title}</span>
      </label>
    </>
  )
}
