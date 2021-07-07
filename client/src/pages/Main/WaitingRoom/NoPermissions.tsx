import { StyledParagraph, WaitingContainer } from './styled'

export const NoPermissions = () => {
  return (
    <WaitingContainer>
      <p>Oops, please check permissions :(</p>
      <StyledParagraph>
        This app needs access to your microphone and camera to work correctly
      </StyledParagraph>
    </WaitingContainer>
  )
}
