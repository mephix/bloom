import { FC, useCallback } from 'react'
import { ActionButton } from './ActionButton'
import { noop } from '../../utils/common'
import { ButtonType, CardProps, CardType, initialUser } from './type'
import { AppButton } from 'components/AppButton'
import placeholderImage from 'assets/images/placeholder.jpg'

import {
  Actions,
  AvatarImage,
  BioWrapper,
  ButtonWrapper,
  CardContainer,
  NameWrapper,
  ScrollableContainer,
  UserInfo
} from './styled'

export const Card: FC<CardProps> = ({
  user = initialUser,
  type = 'join',
  onResolve = noop,
  onReject = noop,
  buttonText
}) => {
  const actionHandler = useCallback(
    type => {
      if (!type) return onReject()
      onResolve(type)
    },
    [onResolve, onReject]
  )

  const buttonsContext = getButtonContext(type, actionHandler, buttonText)

  return (
    <CardContainer>
      <ScrollableContainer>
        <UserInfo>
          <AvatarImage
            defaultSrc={placeholderImage}
            src={user.avatar || placeholderImage}
            transform="c_thumb,g_face,h_200,w_200"
            alt="profile-avatar"
          />
          <NameWrapper>{user.name}</NameWrapper>
          <BioWrapper>{user.bio}</BioWrapper>
        </UserInfo>
      </ScrollableContainer>
      {buttonsContext}
    </CardContainer>
  )
}

function getButtonContext(
  type: CardType,
  actionHandler: (type?: ButtonType) => void,
  text = 'Logout'
) {
  if (type === 'profile')
    return (
      <ButtonWrapper>
        <AppButton onClick={() => actionHandler('profile')} color="light" full>
          {text}
        </AppButton>
      </ButtonWrapper>
    )
  else
    return (
      <Actions>
        <ActionButton onAction={actionHandler} />
        <ActionButton onAction={actionHandler} type={type} />
      </Actions>
    )
}
