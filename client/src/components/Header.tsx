import styled from 'styled-components'
import { version } from '../../package.json'
const StyledHeader = styled.header`
  height: calc(64px + var(--ion-safe-area-top));
  box-sizing: border-box;
  border-bottom: 1px solid white;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: var(--ion-safe-area-top);
  width: 100%;
  background: black;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  position: relative;
`

const LogoWrapper = styled.div`
  text-transform: uppercase;
  font-size: 1.4rem;
  color: white;
`

const Version = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  opacity: 0.2;
  color: white;
`

export const Header = () => {
  return (
    <StyledHeader>
      <Version>v{version}</Version>
      <LogoWrapper>The zero date</LogoWrapper>
    </StyledHeader>
  )
}
