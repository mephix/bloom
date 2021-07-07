import { createGlobalStyle, css } from 'styled-components'
import close from './assets/images/icons/close.svg'
import heart from './assets/images/icons/heart.svg'
import camera from './assets/images/icons/camera.svg'

const OldStyles = css`
  html,
  body,
  #root {
    height: 100%;
  }

  .video-timer {
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: flex-end;
  }

  .video-timer-panel {
    display: inline-flex;
    background: rgb(37, 216, 178);
    width: auto;
    height: 2rem;
    align-items: center;
    justify-content: center;
    padding: 0.3rem;
    border-radius: 4px;
    margin: 0 0.1rem;
    min-width: 2rem;
  }

  .video-timer.ending .video-timer-panel {
    background: rgb(251, 85, 84);
  }

  .bottom-bar {
    background-color: black !important;
    text-align: center;
    top: auto !important;
    bottom: 0;
    border-top: 1px solid #222222;
  }

  .bottom-bar button {
    flex: 1;
    margin: 0 0.2rem;
  }

  .close {
    fill: white !important;
    position: fixed;
    left: 1rem;
  }

  .actionButton {
    width: 50px;
    height: 50px;
    background: none;
    border: none;
    cursor: pointer;
    transition: 0.1s;
    &.reject {
      background: url(${close}) no-repeat center center / 30px 30px;
    }
    &.reject.small {
      background: url(${close}) no-repeat center center / 20px 20px;
    }
    &.like {
      background: url(${heart}) no-repeat center center / 50px 50px;
    }
    &.join {
      background: url(${camera}) no-repeat center center / 100% 100%;
    }
    &.invite {
      color: black;
      background: #9fc5f8;
      text-transform: uppercase;
      width: 70px;
      height: 28px;
      border-radius: 5px;
      font-size: 0.7rem;
      font-family: 'Roboto', sans-serif;
      letter-spacing: 1px;
    }
    &:active {
      opacity: 0.6;
    }
  }

  * {
    outline: none;
    appearance: none;
  }
`

export const GlobalStyle = createGlobalStyle`
  ${OldStyles}
  html {
    user-select: none;
    overflow: hidden;
  }

  body {
    overflow: hidden;
    position: fixed;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: black;
    color: white;
  }

  * {
    -webkit-overflow-scrolling: touch;
    box-sizing: border-box;
    &::-webkit-scrollbar {
      display: none;
      height: 0;
      width: 0;
    }
  }

  input,
  button {
    outline: none;
    appearance: none;
  }

  .grecaptcha-badge {
    visibility: hidden;
  }

  ::-webkit-scrollbar {
    width: 5px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: transparent;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: white;
    border-radius: 20px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: rgb(212, 212, 212);
  }

  @keyframes blink {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes inAnimation {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes outAnimation {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      visibility: hidden;
    }
  }
`
