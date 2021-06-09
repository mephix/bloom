import stylesModule from './UserBlock.module.scss'
import placeholderImage from 'assets/images/placeholder.jpg'
import { FC } from 'react'
import { IonIcon } from '@ionic/react'
import {
  chatboxEllipses,
  closeCircleOutline,
  heart,
  heartOutline
} from 'ionicons/icons'
import { MatchType } from 'state/utils/types'
import { noop } from 'utils'
import { AppImage } from 'components/AppImage/AppImage'

interface UserBlockProps {
  type: MatchType
  name?: string
  bio?: string
  avatar?: string
  onBlock?: Function
  onAction?: (type: MatchType) => void
  onClick?: () => void
}

export const UserBlock: FC<UserBlockProps> = ({
  name,
  bio,
  avatar,
  type,
  onBlock = noop,
  onAction = noop,
  onClick = noop
}) => {
  const typeIcon =
    type === 'both' ? (
      <IonIcon
        className={stylesModule.action}
        onClick={() => onAction(type)}
        size="large"
        icon={chatboxEllipses}
        color="danger"
      />
    ) : type === 'me' ? (
      <IonIcon
        className={stylesModule.action}
        onClick={() => onAction(type)}
        size="large"
        icon={heart}
        color="danger"
      />
    ) : (
      <IonIcon
        className={stylesModule.action}
        onClick={() => onAction(type)}
        size="large"
        icon={heartOutline}
        color="dark"
      />
    )
  return (
    <div className={stylesModule.blockContainer}>
      <div className={stylesModule.user} onClick={onClick}>
        <AppImage
          defaultSrc={placeholderImage}
          className={stylesModule.avatar}
          src={avatar || placeholderImage}
          alt="avatar"
        />
        <div className={stylesModule.info}>
          <span className={stylesModule.name}>{name}</span>
          <span className={stylesModule.bio}>
            {truncateString(bio || '', 40)}
          </span>
        </div>
      </div>
      <div className={stylesModule.actions}>
        {typeIcon}
        <IonIcon
          className={stylesModule.action}
          onClick={() => onBlock()}
          size="large"
          icon={closeCircleOutline}
          color="medium"
        />
      </div>
    </div>
  )
}

function truncateString(text: string, size: number) {
  if (text.length > size) {
    return text.slice(0, size).trim() + '...'
  } else {
    return text
  }
}
