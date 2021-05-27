import {
  ChangeEventHandler,
  DetailedHTMLProps,
  FC,
  InputHTMLAttributes
} from 'react'
import stylesModule from './AppInput.module.scss'
import PhoneInput from 'react-phone-number-input/input'
import { noop } from 'utils'
interface AppInputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label?: string
  full?: boolean
  phone?: boolean
  onChangeText?: (value: string) => void
}

export const AppInput: FC<AppInputProps> = props => {
  const { onChangeText = noop, full, label, phone, ...other } = props
  const input = phone ? (
    <PhoneInput
      className={stylesModule.input}
      onChange={(value: string) => onChangeText(value)}
    />
  ) : (
    <input
      className={stylesModule.input}
      onChange={e => onChangeText(e.target.value)}
      {...other}
    />
  )
  return (
    <label
      className={stylesModule.wrapper}
      style={{ width: full ? '100%' : '' }}
    >
      <span className={stylesModule.label}>{label}</span>
      {input}
    </label>
  )
}
