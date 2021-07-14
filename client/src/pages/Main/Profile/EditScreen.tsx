import { AppButton } from 'components/AppButton'
import { PhotoPicker } from 'components/PhotoPicker'
import { useRef } from 'react'
import { useCallback, useState } from 'react'
import { useHistory } from 'react-router'
import { ImageService } from 'services/image.service'
import { UserService } from 'services/user.service'
import { useAppSelector } from 'store'
import { selectUserData } from 'store/user'
import { Screen } from 'wrappers/Screen'
import {
  EditContainer,
  Label,
  ScrollableContainer,
  StyledTextarea,
  ButtonWrapper,
  SocialMediaInput
} from './styled'

export const EditScreen = () => {
  const user = useAppSelector(selectUserData)
  const [socialMedia, setSocialMedia] = useState(user.socialMedia)
  const [bio, setBio] = useState(user.bio)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [hideTextarea, setHideTextarea] = useState(false)
  const [loading, setLoading] = useState(false)
  const history = useHistory()
  const textareaRef = useRef<HTMLIonTextareaElement | null>(null)

  const fileChangeHandler = useCallback((file: File) => setAvatar(file), [])
  const bioChangeHandler = useCallback((e: any) => setBio(e.target.value), [])
  const socialMediaChangeHandler = useCallback(
    (e: any) => setSocialMedia(e.target.value),
    []
  )

  const doneHandler = useCallback(async () => {
    setLoading(true)
    if (avatar) await UserService.updateAvatar(avatar)
    await UserService.updateUserData({ bio, socialMedia })

    setHideTextarea(true)
    setLoading(false)

    history.goBack()
  }, [history, avatar, bio, socialMedia])

  return (
    <Screen fixed>
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
            defaultPreview={ImageService.transform(user.avatar)}
          />

          <Label>
            <span>
              If you'd like to share your social media instead of a phone
              number, please enter it here. Otherwise, leave the field empty
            </span>
          </Label>

          <SocialMediaInput
            value={socialMedia}
            onChange={socialMediaChangeHandler}
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
              ref={textareaRef}
              onFocus={() => {
                window.scrollTo(0, document.body.scrollHeight - 340)
              }}
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
