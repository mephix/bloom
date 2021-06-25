import styled from 'styled-components'

export const PickerContainer = styled.label`
  display: block;
  width: 200px;
  height: 200px;
  color: white;
  border-radius: 50%;
  overflow: hidden;
  margin: auto;
  input {
    display: none;
  }
  position: relative;
`

export const UploadPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.5rem;
  opacity: 0.8;
  cursor: pointer;
  position: absolute;
  top: 0;
  width: 100%;
`

export const PickerImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`
