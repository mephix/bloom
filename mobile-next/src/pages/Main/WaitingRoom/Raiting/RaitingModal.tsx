import { FC } from 'react'
import { ButtonsWrapper, DoneButton, ModalWrapper } from './styled'

export interface RaitingModalProps {
  modalHandler: (state: boolean) => void
}

export const RaitingModal: FC<RaitingModalProps> = ({ modalHandler }) => {
  return (
    <ModalWrapper>
      <div>Do you want to go on another date?</div>
      <ButtonsWrapper>
        <DoneButton onClick={() => modalHandler(true)}>yes</DoneButton>
        <DoneButton onClick={() => modalHandler(false)}>no</DoneButton>
      </ButtonsWrapper>
    </ModalWrapper>
  )
}
