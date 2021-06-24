import PhoneInput from 'react-phone-number-input/input'
import styled, { css } from 'styled-components'

const inpytStyles = css`
  padding: 10px;
  background: white;
  border: none;
  border-bottom: 3px solid black;
  margin: 5px 0;
  text-align: center;
  font-size: 1.3rem;
`

export const StyledPhoneInput = styled(PhoneInput)`
  ${inpytStyles}
`
export const StyledInput = styled.input`
  ${inpytStyles}
`
export const LabelWrapper = styled('label')<{ full?: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ full }) => (full ? '100%' : 'initial')};
`

export const LabelSpan = styled.span`
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 25px;
  margin-top: 80px;
`

export const SmallText = styled.small`
  text-align: center;
  margin-top: 10px;
  margin-bottom: 5px;
`
