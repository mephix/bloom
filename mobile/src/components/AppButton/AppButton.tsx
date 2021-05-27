import {
  ButtonHTMLAttributes,
  CSSProperties,
  DetailedHTMLProps,
  FC
} from 'react'
import { classes } from 'utils'
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
  loading?: boolean
}

type Colors = 'light' | 'dark' | 'primary'

interface ButtonColors {
  background: string
  color: string
  border?: string
}

export const AppButton: FC<AppButtonProps> = props => {
  const {
    children,
    loading,
    clear,
    style,
    color = 'primary',
    full,
    ...other
  } = props
  const clearBackground = clear
    ? { background: 'none', border: 'none', color: THEME.PRIMARY }
    : {}
  return (
    <button
      {...other}
      className={classes(
        moduleStyles.button,
        loading ? moduleStyles.loading : ''
      )}
      style={{
        ...setColor(color),
        width: full ? '100%' : '',
        ...clearBackground,
        ...style
      }}
      disabled={loading}
    >
      {loading ? <Loader /> : children}
    </button>
  )
}

const Loader = () => (
  <div className={moduleStyles['lds-ring']}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
)

const setColor = (color: Colors): ButtonColors => {
  switch (color) {
    case 'light':
      return { color: 'black', background: THEME.LIGHT }
    case 'dark':
      return { color: 'white', background: THEME.DARK }
    case 'primary':
      return { color: 'black', background: THEME.PRIMARY }
    default:
      return { color: 'black', background: THEME.LIGHT }
  }
}
