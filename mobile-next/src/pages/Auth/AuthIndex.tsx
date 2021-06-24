import { FC, useCallback } from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'
import { Screen } from 'wrappers/Screen'
import { AuthContainer } from './styled'
import { AppButton } from 'components/AppButton'
// @ts-ignore
import logo from 'assets/images/logo.jpeg'

const LogoImage = styled.div`
  height: 624px;
  background: url(${logo}) no-repeat center top;
`

const StyledAppButton = styled(AppButton)`
  margin-bottom: 60px !important;
  min-height: 42px;
`

export const AuthIndex: FC = () => {
  const history = useHistory()
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
