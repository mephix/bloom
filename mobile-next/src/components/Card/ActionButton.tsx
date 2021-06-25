import { FC, useCallback } from 'react'
import { noop } from '../../utils/common'
import { ActionButtonProps } from './type'

export const ActionButton: FC<ActionButtonProps> = ({
  type,
  onAction = noop,
  small
}) => {
  const clickHandler = useCallback(() => onAction(type), [onAction, type])

  if (type === 'join')
    return (
      <button onClick={clickHandler} className="actionButton join"></button>
    )
  if (type === 'like')
    return (
      <button onClick={clickHandler} className="actionButton like"></button>
    )
  if (type === 'invite')
    return (
      <button onClick={clickHandler} className="actionButton invite">
        Invite
      </button>
    )
  else
    return (
      <button
        onClick={clickHandler}
        className={`actionButton reject ${small ? 'small' : ''}`}
      ></button>
    )
}
