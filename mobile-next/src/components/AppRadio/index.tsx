import { LabelSpan } from 'components/AppInput/styled'
import { FC, useMemo } from 'react'
import { noop } from 'utils'
// import inputStylesModule from '../AppInput/AppInput.module.scss'
import { RadioChip, RadioContainer, RadioInput, Wrapper } from './styled'

interface AppRadioProps {
  defaultValue?: string
  values: string[]
  label?: string
  full?: boolean
  onChange?: (value: string) => void
}

export const AppRadio: FC<AppRadioProps> = ({
  label,
  values,
  onChange = noop,
  defaultValue
}) => {
  const name = useMemo(randomName, [])

  const buttons = values.map(value => (
    <label key={value}>
      <RadioInput
        type="radio"
        name={name}
        value={value}
        hidden
        defaultChecked={value === defaultValue}
      />
      <RadioChip className="chip">{value}</RadioChip>
    </label>
  ))

  return (
    <Wrapper>
      <LabelSpan>{label}</LabelSpan>
      <RadioContainer
        onChange={({ target: { value } }: any) => value && onChange(value)}
      >
        {buttons}
      </RadioContainer>
    </Wrapper>
  )
}

function randomName() {
  return Math.random().toString(36).substring(7)
}
