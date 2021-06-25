import styled, { css } from 'styled-components'
export type Colors = 'light' | 'dark' | 'primary'

interface StyledButtonProps {
  color?: Colors
  full?: boolean
  loading?: boolean
}

export const StyledButton = styled('button')<StyledButtonProps>`
  text-transform: uppercase;
  padding: 10px 16px;
  border-radius: 25px;
  font-size: 1.4rem;
  transition: 0.4s;
  ${({ theme, color = 'light' }) => css`
    background: ${theme[color]};
    color: ${theme[color] === 'dark' ? 'white' : 'black'};
  `};

  width: ${({ full }) => (full ? '100%' : 'initial')};

  &:active {
    opacity: 0.6;
  }
  ${({ disabled, full }) =>
    disabled &&
    css`
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
      width: ${full ? '100%' : '60px'};
      height: 50px;
    `}
`
