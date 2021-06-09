import { FC, useCallback } from 'react'
import { ActionButton } from './ActionButton'
import stylesModule from './Card.module.scss'
import { noop } from '../../utils/common'
import { ButtonType, CardProps, CardType } from './Card.type'
import { AppButton } from 'components/AppButton'
import placeholderImage from 'assets/images/placeholder.jpg'
import { AppImage } from 'components/AppImage/AppImage'

const initialUser = {
  avatar: '',
  name: '',
  bio: ''
}

export const Card: FC<CardProps> = ({
  user = initialUser,
  type = 'join',
  onResolve = noop,
  onReject = noop,
  buttonText
}) => {
  const actionHandler = useCallback(
    type => {
      if (!type) return onReject()
      onResolve(type)
    },
    [onResolve, onReject]
  )

  const buttonsContext = getButtonContext(type, actionHandler, buttonText)

  return (
    <div className={stylesModule.card}>
      <div className={stylesModule.scrollable}>
        <div className={stylesModule.userInfo}>
          <AppImage
            defaultSrc={placeholderImage}
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
  actionHandler: (type?: ButtonType) => void,
  text = 'Logout'
) {
  if (type === 'profile')
    return (
      <div className={stylesModule.buttonWrapper}>
        <AppButton onClick={() => actionHandler('profile')} color="light" full>
          {text}
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
