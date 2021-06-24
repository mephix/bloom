import stylesModule from './AppInput.module.scss'

import { IonDatetime, isPlatform } from '@ionic/react'
import { FC, useCallback, useMemo, useRef, useState } from 'react'
import { DateTime } from 'luxon'
import { noop } from 'utils'

interface DateInputProps {
  onChangeText?: (value: string) => void
  value?: string
}

export const DateInput: FC<DateInputProps> = ({
  onChangeText = noop,
  value
}) => {
  const defaultDate = useMemo(() => {
    if (value) return DateTime.fromISO(value)
    else return DateTime.now()
  }, [value])
  const datePickerRef = useRef<HTMLIonDatetimeElement>(null)
  const [date, setDate] = useState(defaultDate)

  const selectHandler = useCallback(() => {
    if (!datePickerRef?.current) return
    datePickerRef.current.open()
  }, [])
  return (
    <>
      <div className={stylesModule.dateWrapper} onClick={selectHandler}>
        <span>{addZero(date.month)}</span>
        <span>{addZero(date.day)}</span>
        <span className={stylesModule.year}>{date.year}</span>
      </div>
      <IonDatetime
        hidden={true}
        ref={datePickerRef}
        mode={isPlatform('ios') ? 'ios' : 'md'}
        onIonChange={e => {
          const newDate = DateTime.fromISO(e.detail.value!)
          setDate(newDate)
          onChangeText(newDate.toISODate())
        }}
        value={date.toISODate()}
      />
    </>
  )
}

const addZero = (num: number) => (num < 10 ? `0${num}` : `${num}`)
