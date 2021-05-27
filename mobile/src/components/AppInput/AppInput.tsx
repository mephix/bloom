import { DetailedHTMLProps, FC, InputHTMLAttributes } from 'react'
import stylesModule from './AppInput.module.scss'
interface AppInputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  placeholder?: string
  full?: boolean
}

export const AppInput: FC<AppInputProps> = props => {
  const { full, placeholder, ...other } = props
  return (
    <>
      <label
        className={stylesModule.wrapper}
        style={{ width: full ? '100%' : '' }}
      >
        <span>{placeholder}</span>
        <input className={stylesModule.input} {...other} />
      </label>
    </>
  )
}
