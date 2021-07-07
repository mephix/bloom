import { StyledParagraph, WaitingContainer } from './styled'

export const NotSafari = () => {
  return (
    <WaitingContainer>
      <p>Oops, please use Safari</p>
      <StyledParagraph>
        Apparently you are not using Safari on your iOS device. You need to use
        Safari for some functions to work
      </StyledParagraph>
    </WaitingContainer>
  )
}
