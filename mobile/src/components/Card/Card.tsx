import { FC, useCallback } from 'react'
import { ActionButton } from './ActionButton'
import stylesModule from './Card.module.scss'
import { noop } from '../../utils/common'
import { ButtonType, CardProps, CardType } from './Card.type'
import { AppButton } from 'components/AppButton'
import placeholderImage from 'assets/images/placeholder.jpg'

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

  const buttonsContext = getButtonContext(type, actionHandler)

  return (
    <div className={stylesModule.card}>
      <div className={stylesModule.scrollable}>
        <div className={stylesModule.userInfo}>
          <img
            className={stylesModule.avatar}
            src={user.avatar || placeholderImage}
            alt="profile-avatar"
          />
          <div className={stylesModule.name}>{user.name}</div>
          <div className={stylesModule.bio}>{user.bio}</div>
        </div>
      </div>
      {buttonsContext}
    </div>
  )
}

function getButtonContext(
  type: CardType,
  actionHandler: (type?: ButtonType) => void
) {
  if (type === 'profile')
    return (
      <div className={stylesModule.buttonWrapper}>
        <AppButton onClick={() => actionHandler('profile')} color="light" full>
          Logout
        </AppButton>
      </div>
    )
  else
    return (
      <div className={stylesModule.actions}>
        <ActionButton onAction={actionHandler} />
        <ActionButton onAction={actionHandler} type={type} />
      </div>
    )
}
