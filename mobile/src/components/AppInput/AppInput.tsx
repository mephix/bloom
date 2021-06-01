import React, { DetailedHTMLProps, FC, InputHTMLAttributes } from 'react'
import stylesModule from './AppInput.module.scss'
import PhoneInput from 'react-phone-number-input/input'
import { noop } from 'utils'
import { DateInput } from './DateInput'
import { IonIcon, IonRange } from '@ionic/react'
import { person } from 'ionicons/icons'
interface AppInputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label?: string
  full?: boolean
  phone?: boolean
  date?: boolean
  range?: boolean
  rangeOptions?: RangeOptions
  icon?: string
  small?: string
  onChangeText?: (value: string) => void
}

interface RangeOptions {
  min: number
  max: number
}

export const AppInput: FC<AppInputProps> = props => {
  const {
    onChangeText = noop,
    small,
    date,
    full,
    label,
    phone,
    range,
    rangeOptions,
    icon,
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
  else if (range)
    input = (
      <IonRange
        {...rangeOptions}
        color="dark"
        pin={true}
        value={{ lower: rangeOptions?.min || 0, upper: rangeOptions?.max || 0 }}
        dualKnobs
      >
        <IonIcon size="small" slot="start" icon={icon} />
        <IonIcon slot="end" icon={icon} />
      </IonRange>
    )
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
