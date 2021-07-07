import { FC } from 'react'
// import { CountDownProps } from './CountDown.type'
import { CountDownBox } from './CountDownBox'
import { noop } from 'utils/common'
import { CountDownProps } from './types'
import {
  CountDownBio,
  CountDownContainer,
  CountDownInfo,
  CountDownName,
  CountDownUserInfo
} from '../styled'

export const CountDown: FC<CountDownProps> = ({
  onComplete = noop,
  firstName,
  bio,
  timeout
}) => {
  return (
    <CountDownContainer>
      <CountDownBox timeout={timeout} onComplete={onComplete} />
      <CountDownInfo>you have a date with...</CountDownInfo>
      <CountDownUserInfo>
        <CountDownName>{firstName}</CountDownName>
        <CountDownBio>{bio}</CountDownBio>
      </CountDownUserInfo>
    </CountDownContainer>
  )
}
