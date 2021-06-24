import { Loader } from 'components/Loader'
import { FC } from 'react'
import { StyledButton } from './styled'

interface AppButtonProps {
  color?: Colors
  full?: boolean
  clear?: boolean
  loading?: boolean
}

type Colors = 'light' | 'dark' | 'primary'

export const AppButton: FC<
  AppButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
> = props => {
  const { children, loading, clear, color = 'primary', full, ...other } = props

  return (
    <StyledButton {...other} disabled={loading} color={color} full={full}>
      {loading ? <Loader small /> : children}
    </StyledButton>
  )
}
