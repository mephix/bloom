import { AppButton } from 'components/AppButton'
import { PhotoPicker } from 'components/PhotoPicker'
import { useCallback, useState } from 'react'
import { useHistory } from 'react-router'
import { UserService } from 'services/user.service'
import { useAppSelector } from 'store'
import { selectUserData } from 'store/user'
import { Screen } from 'wrappers/Screen'
import {
  EditContainer,
  Label,
  ScrollableContainer,
  StyledTextarea,
  ButtonWrapper
} from './styled'

export const EditScreen = () => {
  const user = useAppSelector(selectUserData)
  const [bio, setBio] = useState(user.bio)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [hideTextarea, setHideTextarea] = useState(false)
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  const fileChangeHandler = useCallback((file: File) => setAvatar(file), [])
  const bioChangeHandler = useCallback((e: any) => setBio(e.target.value), [])

  const doneHandler = useCallback(async () => {
    setLoading(true)
    if (avatar) await UserService.updateAvatar(avatar)
    await UserService.updateUserData({ bio })

    setHideTextarea(true)

    history.goBack()
  }, [history, avatar, bio])

  return (
    <Screen>
      <EditContainer>
        <ScrollableContainer>
          <Label>
            <span>
              Please upload a clear photo of your face. Your photo isn't shown
              to people before a date, but it helps them find you afterwards.
            </span>
          </Label>

          <PhotoPicker
            onChangeFile={fileChangeHandler}
            defaultPreview={user.avatar}
          />

          <Label>
            <span>
              Tell the person you're about to meet something about yourself.
            </span>
          </Label>
          {!hideTextarea && (
            <StyledTextarea
              onIonChange={bioChangeHandler}
              value={bio}
              autoGrow
              placeholder="Enter Text"
            />
          )}
        </ScrollableContainer>

        <ButtonWrapper>
          <AppButton
            full
            onClick={doneHandler}
            color="primary"
            loading={loading}
          >
            Done
          </AppButton>
        </ButtonWrapper>
      </EditContainer>
    </Screen>
  )
}
