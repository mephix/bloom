import { FC, useMemo } from 'react'
import { noop } from 'utils'
import inputStylesModule from '../AppInput/AppInput.module.scss'
import stylesModule from './AppRadio.module.scss'
interface AppRadioProps {
  values: string[]
  label?: string
  full?: boolean
  onChange?: (value: string) => void
}

export const AppRadio: FC<AppRadioProps> = ({
  label,
  values,
  onChange = noop
}) => {
  const name = useMemo(randomName, [])

  const buttons = values.map(value => (
    <label key={value}>
      <input
        className={stylesModule.radio}
        type="radio"
        name={name}
        value={value}
        hidden
      />
      <div className={stylesModule.chip}>{value}</div>
    </label>
  ))

  return (
    <div className={inputStylesModule.wrapper} style={{ width: '100%' }}>
      <span className={inputStylesModule.label}>{label}</span>
      <div
        onChange={({ target: { value } }: any) => value && onChange(value)}
        className={stylesModule.radioContainer}
      >
        {buttons}
      </div>
    </div>
  )
}

function randomName() {
  return Math.random().toString(36).substring(7)
}
