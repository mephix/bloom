import React, { DetailedHTMLProps, FC, InputHTMLAttributes } from 'react'
import stylesModule from './AppInput.module.scss'
import PhoneInput from 'react-phone-number-input/input'
import { noop } from 'utils'
import { DateInput } from './DateInput'
import { IonRange } from '@ionic/react'
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
  rangeValue?: { lower: number; upper: number }
  onChangeRange?: (range: { lower: number; upper: number }) => void
}

interface RangeOptions {
  min: number
  max: number
}

export const AppInput: FC<AppInputProps> = props => {
  const {
    onChangeText = noop,
    onChangeRange = noop,
    small,
    date,
    full,
    label,
    phone,
    range,
    rangeOptions,
    icon,
    rangeValue,
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
        style={{ margin: '0 15px' }}
        {...rangeOptions}
        color="dark"
        pin={true}
        value={rangeValue}
        dualKnobs
        onIonChange={(e: any) => {
          onChangeRange(e.detail.value)
        }}
      ></IonRange>
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
