import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

export const RadioContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 20px;
`

export const RadioInput = styled.input`
  &:checked + .chip {
    background: black;
    color: white;
  }
`

export const RadioChip = styled.div`
  cursor: pointer;
  text-align: center;
  width: 70px;
  border: 1px solid black;
  border-radius: 25px;
  text-transform: uppercase;
  font-size: 1rem;
  padding: 5px 0;
  margin: 0 15px;
  transition: 0.2s;
`
