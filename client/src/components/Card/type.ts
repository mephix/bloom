export type CardType = 'join' | 'invite' | 'like' | 'profile'

export const initialUser = {
  avatar: '',
  name: '',
  bio: ''
}

export interface CardProps {
  user?: typeof initialUser
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
