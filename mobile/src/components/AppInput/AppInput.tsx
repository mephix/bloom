import { DetailedHTMLProps, FC, InputHTMLAttributes } from 'react'
import stylesModule from './AppInput.module.scss'
import PhoneInput from 'react-phone-number-input/input'
import { noop } from 'utils'
import { DateInput } from './DateInput'
interface AppInputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label?: string
  full?: boolean
  phone?: boolean
  date?: boolean
  small?: string
  onChangeText?: (value: string) => void
}

export const AppInput: FC<AppInputProps> = props => {
  const {
    onChangeText = noop,
    small,
    date,
    full,
    label,
    phone,
    ...other
  } = props
  let input
  if (phone)
    input = (
      <PhoneInput
        className={stylesModule.input}
        onChange={(value: string) => onChangeText(value)}
      />
    )
  else if (date) input = <DateInput onChangeText={onChangeText} />
  else
    input = (
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
      {small && <small className={stylesModule.smallText}>{small}</small>}
    </label>
  )
}
