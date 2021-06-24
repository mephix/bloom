import { User } from 'pages/Main/WaitingRoom/screens/WaitingRoom/WaitingRoom.type'

export type CardType = 'join' | 'invite' | 'like' | 'profile'

export interface CardProps {
  user?: User
  type: CardType
  onResolve?: (type: CardType) => void
  onReject?: () => void
  width?: number
  height?: number
  background?: string
  buttonText?: string
}

export type ButtonType = 'join' | 'like' | 'invite' | 'profile' | undefined

export type ActionButtonProps = {
  type?: ButtonType
  onAction?: (type: ButtonType) => void
  small?: boolean
}
