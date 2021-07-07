import { FC, useCallback, useEffect } from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'
import { Screen } from 'wrappers/Screen'
import { AuthContainer } from './styled'
import logo from 'assets/images/logo.jpeg'
import { useAppSelector } from 'store'
import { selectAuth } from 'store/user'
import { AppButton } from 'components/AppButton'

const LogoImage = styled.div`
  height: 624px;
  background: url(${logo}) no-repeat center top;
`

const StyledAppButton = styled(AppButton)`
  margin-bottom: 60px !important;
  min-height: 42px;
`

export const useAuthWithoutInfo = () => {
  const history = useHistory()
  const auth = useAppSelector(selectAuth)
  useEffect(() => {
    if (auth === 'without_information') history.replace('/register/get-info')
  }, [history, auth])
}

export const AuthIndex: FC = () => {
  const history = useHistory()
  useAuthWithoutInfo()
  return (
    <Screen color="dark">
      <LogoImage />
      <AuthContainer index>
        <StyledAppButton
          onClick={useCallback(() => history.push('/register'), [history])}
          full
        >
          Let's go
        </StyledAppButton>
      </AuthContainer>
    </Screen>
  )
}
