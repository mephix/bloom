import { AppImage } from 'components/AppImage/AppImage'
import styled from 'styled-components'

export const CardContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    background: linear-gradient(180deg, rgba(0, 0, 0, 1) 30%, transparent 100%);
    width: 100%;
    height: 40px;
    top: 0;
    left: 0;
  }
`

export const ScrollableContainer = styled.div`
  height: 100%;
  overflow: auto;
`

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 50px;
  padding-bottom: 120px;
`

export const NameWrapper = styled.div`
  text-align: center;
  font-size: 2rem;
  margin: 30px 0;
`

export const BioWrapper = styled.div`
  text-align: center;
  padding: 0 45px;
  white-space: pre-wrap;
`

export const AvatarImage = styled(AppImage)`
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 50%;
`

export const ButtonWrapper = styled.div`
  width: 100%;
  padding: 0 20px;
  position: absolute;
  bottom: 0;
  padding-bottom: 60px;
  padding-top: 20px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 1) 75%, transparent 100%);
`

export const Actions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  justify-content: space-around;
  background: linear-gradient(0deg, rgba(0, 0, 0, 1) 75%, transparent 100%);
  width: 100%;
  height: 100px;
  margin-top: auto;
  position: absolute;
  bottom: 0px;
  left: 0;
  padding-top: 20px;
`
