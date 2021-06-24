import styled, { css } from 'styled-components'

export const AuthContainer = styled('div')<{ index?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  padding: 0 40px;
  > button {
    margin: 10px 0;
  }

  ${props =>
    props.index &&
    css`
      justify-content: flex-end;
      margin-bottom: var(--ion-safe-area-top);
      height: calc(100% - 624px);

      > button {
        margin: 12px 0;
      }
    `}
`
