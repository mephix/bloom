import {
  ButtonHTMLAttributes,
  CSSProperties,
  DetailedHTMLProps,
  FC
} from 'react'
import { THEME } from '../../theme/theme'
import moduleStyles from './AppButton.module.scss'

interface AppButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  color?: Colors
  full?: boolean
  clear?: boolean
  style?: CSSProperties
}

type Colors = 'light' | 'dark' | 'primary'

interface ButtonColors {
  background: string
  color: string
  border?: string
}

export const AppButton: FC<AppButtonProps> = props => {
  const { children, clear, style, color = 'primary', full, ...other } = props
  const clearBackground = clear
    ? { background: 'none', border: 'none', color: THEME.PRIMARY }
    : {}
  return (
    <button
      {...other}
      className={moduleStyles.button}
      style={{
        ...setColor(color),
        width: full ? '100%' : '',
        ...clearBackground,
        ...style
      }}
    >
      {children}
    </button>
  )
}
const setColor = (color: Colors): ButtonColors => {
  switch (color) {
    case 'light':
      return {
        color: 'black',
        background: THEME.LIGHT,
        border: '2px solid rgba(128, 128, 128, 0.6)'
      }
    case 'dark':
      return { color: 'white', background: THEME.DARK }
    case 'primary':
      return { color: 'white', background: THEME.PRIMARY }
    default:
      return { color: 'black', background: THEME.LIGHT }
  }
}
