import { IonDatetime, isPlatform } from '@ionic/react'
import { FC, useCallback, useMemo, useRef, useState } from 'react'
import { DateTime } from 'luxon'
import styled from 'styled-components'
import { noop } from 'utils'

interface DateInputProps {
  onChangeText?: (value: string) => void
  value?: string
}

const DateWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-size: 1.4rem;
  border-top: 3px solid black;
  border-bottom: 3px solid black;
  padding: 2px 0;
  transition: 0.2s;
  cursor: pointer;
  user-select: none;
  &:active {
    opacity: 0.4;
  }
`

const YearSpan = styled.span`
  width: 40px;
  white-space: nowrap;
  margin-left: -10px;
`

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
      <DateWrapper onClick={selectHandler}>
        <span>{addZero(date.month)}</span>
        <span>{addZero(date.day)}</span>
        <YearSpan>{date.year}</YearSpan>
      </DateWrapper>
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
