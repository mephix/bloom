import { FC } from 'react'
import styled, { keyframes } from 'styled-components'

interface LoaderProps {
  color?: string
  small?: boolean
}

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

export const LoaderContainer = styled.div`
  display: grid;
  place-items: center;
  height: 100%;
`

const LoaderRings = styled('div')<{ small?: boolean }>`
  display: inline-block;
  position: relative;
  width: ${({ small }) => (small ? '38px' : '80px')};
  height: ${({ small }) => (small ? '38px' : '80px')};

  & div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: ${({ small }) => (small ? '30px' : '64px')};
    height: ${({ small }) => (small ? '30px' : '64px')};
    margin: ${({ small }) => (small ? '4px' : '8px')};
    border: ${({ small }) => (small ? '4px' : '8px')} solid #fff;
    border-radius: 50%;
    animation: ${spin} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #fff transparent transparent transparent;
  }
  & div:nth-child(1) {
    animation-delay: -0.45s;
  }
  & div:nth-child(2) {
    animation-delay: -0.3s;
  }
  & div:nth-child(3) {
    animation-delay: -0.15s;
  }
`

const Ring = styled.div`
  border-color: ${props => props.color} transparent transparent transparent;
`

export const Loader: FC<LoaderProps> = ({ color = '#fff', small }) => (
  <LoaderRings small={small}>
    <Ring color={color} />
    <Ring color={color} />
    <Ring color={color} />
    <Ring color={color} />
  </LoaderRings>
)
