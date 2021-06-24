import { FC } from 'react'
import { noop } from 'utils'
import { DateInput } from './DateInput'
import { IonRange } from '@ionic/react'
import {
  LabelSpan,
  LabelWrapper,
  SmallText,
  StyledInput,
  StyledPhoneInput
} from './styled'

interface RangeOptions {
  min: number
  max: number
}

interface AppInputProps {
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

export const AppInput: FC<
  AppInputProps & React.InputHTMLAttributes<HTMLInputElement>
> = props => {
  const { full, small, label } = props
  const input = defineInputType(props)
  return (
    <LabelWrapper full={full}>
      <LabelSpan>{label}</LabelSpan>
      {input}
      {small && <SmallText>{small}</SmallText>}
    </LabelWrapper>
  )
}

function defineInputType(
  props: AppInputProps & React.InputHTMLAttributes<HTMLInputElement>
) {
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

  if (phone)
    return (
      <StyledPhoneInput
        {...other}
        onChange={(value: string) => onChangeText(value)}
      />
    )
  else if (date) return <DateInput onChangeText={onChangeText} />
  else if (range)
    return (
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
    return (
      <StyledInput onChange={e => onChangeText(e.target.value)} {...other} />
    )
}
