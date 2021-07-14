import placeholderImage from 'assets/images/placeholder.jpg'
import { FC } from 'react'
import {
  chatboxEllipses,
  closeCircleOutline,
  heart,
  heartOutline
} from 'ionicons/icons'
import { noop } from 'utils'
import { MatchType } from 'services/matches.service/types'
import {
  ActionIcon,
  ActionsContainer,
  BlockContainer,
  UserAvatar,
  UserContainer,
  UserInfo
} from './styled'

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
      <ActionIcon
        onClick={() => onAction(type)}
        size="large"
        icon={chatboxEllipses}
        color="danger"
      />
    ) : type === 'me' ? (
      <ActionIcon
        onClick={() => onAction(type)}
        size="large"
        icon={heart}
        color="danger"
      />
    ) : (
      <ActionIcon
        onClick={() => onAction(type)}
        size="large"
        icon={heartOutline}
        color="dark"
      />
    )
  return (
    <BlockContainer>
      <UserContainer onClick={onClick}>
        <UserAvatar
          defaultSrc={placeholderImage}
          src={avatar || placeholderImage}
          alt="avatar"
          transform="c_thumb,g_face,h_60,w_60"
        />
        <UserInfo>
          <span>{name}</span>
          <span className="bio">{truncateString(bio || '', 40)}</span>
        </UserInfo>
      </UserContainer>
      <ActionsContainer>
        {typeIcon}
        <ActionIcon
          onClick={() => onBlock()}
          size="large"
          icon={closeCircleOutline}
          color="medium"
        />
      </ActionsContainer>
    </BlockContainer>
  )
}

function truncateString(text: string, size: number) {
  if (text.length > size) {
    return text.slice(0, size).trim() + '...'
  } else {
    return text
  }
}
