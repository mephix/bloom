import { User } from '../../screens/WaitingRoom/WaitingRoom.type'

export type CardType = 'join' | 'invite' | 'like'

export interface CardProps {
  user?: User
  type: 'join' | 'invite' | 'like'
  onResolve?: (type: CardType) => void
  onReject?: () => void
  width?: number
  height?: number
  background?: string
}

export type ButtonType = 'join' | 'like' | 'invite' | undefined

export type ActionButtonProps = {
  type?: ButtonType
  onAction?: (type: ButtonType) => void
  small?: boolean
}
