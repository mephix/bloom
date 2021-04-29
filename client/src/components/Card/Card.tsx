import { FC, useCallback } from 'react'
import { ActionButton } from './ActionButton'
import stylesModule from './Card.module.scss'
import { noop } from '../utils'
import { CardProps } from './Card.type'

const initialUser = {
  avatar: '',
  name: '',
  bio: ''
}

export const Card: FC<CardProps> = ({
  user = initialUser,
  type = 'join',
  onResolve = noop,
  onReject = noop
}) => {
  const actionHandler = useCallback(
    type => {
      if (!type) return onReject()
      onResolve(type)
    },
    [onResolve, onReject]
  )

  return (
    <div className={stylesModule.card}>
      <div className={stylesModule.userInfo}>
        <img
          className={stylesModule.avatar}
          src={user.avatar}
          alt="profile-avatar"
        />
        <div className={stylesModule.name}>{user.name}</div>
        <div className={stylesModule.bio}>{user.bio}</div>
      </div>
      <div className={stylesModule.actions}>
        <ActionButton onAction={actionHandler} />
        <ActionButton onAction={actionHandler} type={type} />
      </div>
    </div>
  )
}
