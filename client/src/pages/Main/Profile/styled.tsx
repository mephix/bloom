import { IonFab, IonTextarea, IonInput } from '@ionic/react'
import styled from 'styled-components'

export const EditContainer = styled.div`
  height: 100%;
  position: relative;
`

export const LowerIonFab = styled(IonFab)`
  margin-top: 80px;
`

export const ScrollableContainer = styled.div`
  height: 100%;
  overflow: auto;
  padding: 10px;
`

export const Label = styled.div`
  color: #444444;
  text-align: center;
  margin: 20px 0;
  padding: 0 20px;
`

export const ButtonWrapper = styled.div`
  width: 100%;
  height: 100px;
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 0 10px;
  padding-top: 20px;
  background: white;
  z-index: 100;
`
export const StyledTextarea = styled(IonTextarea)`
  border: 2px solid #d0d0d0;
  border-radius: 4px;
  padding: 10px;
  text-align: center;
  margin-bottom: 100px;
`

export const SocialMediaInput = styled(IonInput)`
  border: 2px solid #d0d0d0;
  border-radius: 4px;
  padding: 10px;
  text-align: center;
  width: 100%;
  margin-bottom: 20px;
`
