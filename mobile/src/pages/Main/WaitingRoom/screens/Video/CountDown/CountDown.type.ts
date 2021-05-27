export interface CountDownBoxProps {
  seconds?: number
  onComplete?: () => void
  timeout: number
}

export interface CountDownProps {
  firstName: string
  bio: string
  onComplete?: () => void
  timeout: number
}
