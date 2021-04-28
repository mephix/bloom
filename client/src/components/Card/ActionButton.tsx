import { FC, useCallback } from 'react'
import { noop } from '../utils'
import stylesModule from './Card.module.scss'
import { ActionButtonProps } from './Card.type'

export const ActionButton: FC<ActionButtonProps> = ({
  type,
  onAction = noop
}) => {
  const clickHandler = useCallback(() => onAction(type), [onAction, type])

  if (type === 'join')
    return (
      <button onClick={clickHandler} className={stylesModule.join}></button>
    )
  if (type === 'like')
    return (
      <button onClick={clickHandler} className={stylesModule.like}></button>
    )
  if (type === 'invite')
    return (
      <button onClick={clickHandler} className={stylesModule.invite}>
        Invite
      </button>
    )
  else
    return (
      <button onClick={clickHandler} className={stylesModule.reject}></button>
    )
}
