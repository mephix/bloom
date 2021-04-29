import React, { useState, useEffect, useCallback, FC } from 'react'
import { IconToggleProps } from './IconToggle.type'
import { classes, noop } from '../../utils'
import stylesModule from './IconToggle.module.scss'
import { HeartIcon } from './icons/HeartIcon'
import { DislikeIcon } from './icons/DislikeIcon'
import { Heart } from './IconToggle.stories'

export const IconToggle: FC<IconToggleProps> = ({
  toggled = false,
  onToggle = noop,
  type,
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
  const Icon =
    type === 'heart' ? (
      <HeartIcon size={30} filled={state} />
    ) : (
      <DislikeIcon size={34} filled={state} />
    )

  return (
    <div className={classes(stylesModule.switch, className)}>
      <input
        value={state.toString()}
        checked={state}
        onChange={changeHandler}
        type="checkbox"
      />
      {Icon}
    </div>
  )
}
