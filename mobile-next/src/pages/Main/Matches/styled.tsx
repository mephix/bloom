import { IonIcon } from '@ionic/react'
import { AppImage } from 'components/AppImage/AppImage'
import styled, { css } from 'styled-components'

export const SectionsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 50px;
`

export const Section = styled.div<{ selected: boolean }>`
  padding: 5px 10px;
  border-radius: 25px;
  border: 2px solid black;
  width: 180px;
  display: flex;
  justify-content: center;
  cursor: pointer;
  transition: 0.3s;
  ${({ selected }) =>
    selected &&
    css`
      background: #cfb9ff;
    `}
`

export const ActionsContainer = styled.div`
  width: 80px;
  display: flex;
  justify-content: space-between;
  opacity: 0.8;
`

export const ActionIcon = styled<any>(IonIcon)`
  cursor: pointer;
  transition: 0.1s;
  &:active {
    opacity: 0.3;
  }
`
export const BlockContainer = styled.div`
  background: #f5f5f5;
  padding: 5px;
  margin: 15px 10px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`
export const UserContainer = styled.div`
  display: flex;
  cursor: pointer;
`
export const UserAvatar = styled(AppImage)`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
`

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  max-width: 150px;
  .bio {
    font-size: 0.8rem;
    color: #8a8a8a;
  }
`
