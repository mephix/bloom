import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  html {
    user-select: none;
    overflow: hidden;
  }

  body {
    overflow: hidden;
    position: fixed;
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
