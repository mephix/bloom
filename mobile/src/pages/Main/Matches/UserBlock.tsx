import stylesModule from './UserBlock.module.scss'
import placeholderImage from 'assets/images/placeholder.jpg'
import { FC } from 'react'
import { IonIcon } from '@ionic/react'
import { closeCircleOutline, heart } from 'ionicons/icons'

interface UserBlockProps {
  name?: string
  bio?: string
  avatar?: string
  type: 'date' | 'match',
  onBlock?: Function
}

export const UserBlock: FC<UserBlockProps> = ({ name, bio, avatar, type, onBlock }) => {
  return (
    <div className={stylesModule.blockContainer}>
      <div className={stylesModule.user}>
        <img
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
        <IonIcon size="large" icon={heart} color="danger" />
        <IonIcon size="large" icon={closeCircleOutline} color="medium" />
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
