import { FC } from 'react'
import { useAppSelector } from 'store'
import { selectAppParams } from 'store/app'
import { BlindContainer, BlindText, BlindTitle } from './styled'

export const BlindScreen: FC = () => {
  const params = useAppSelector(selectAppParams)

  return (
    <BlindContainer>
      <BlindTitle>Blind Date</BlindTitle>
      <BlindText>{params.BLIND_DATES_SEEN}</BlindText>
    </BlindContainer>
  )
}
