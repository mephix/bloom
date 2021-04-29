export interface IconToggleProps {
  toggled?: boolean
  type: 'heart' | 'dislike'
  onToggle?: (state: boolean) => void
  className?: string
}

export interface IconProps {
  filled?: boolean
  color?: string
  size: number
}
