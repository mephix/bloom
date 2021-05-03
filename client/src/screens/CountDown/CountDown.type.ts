// interface UserWithoutAvatar {
//   name: string
//   bio: string
// }

// export interface CountDownProps {
//   user: UserWithoutAvatar
//   onComplete?: () => void
// }

export interface CountDownBoxProps {
  seconds?: number
  onComplete?: () => void
}
