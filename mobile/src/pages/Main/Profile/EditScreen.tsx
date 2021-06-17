import { IonTextarea } from '@ionic/react'
import { AppButton } from 'components/AppButton'
import { PhotoPicker } from 'components/PhotoPicker'
import { storage } from 'firebaseService'
import { useCallback, useState } from 'react'
import { useHistory } from 'react-router'
import user from 'state/user'
import { Screen } from 'wrappers/Screen'
import stylesModule from './Profile.module.scss'

export const EditScreen = () => {
  const [hideTextarea, setHideTextarea] = useState(false)
  const [bio, setBio] = useState(user.bio)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  const fileChangeHandler = useCallback((file: File) => setAvatar(file), [])
  const bioChangeHandler = useCallback((e: any) => setBio(e.target.value), [])

  const doneHandler = useCallback(async () => {
    setLoading(true)
    if (avatar) {
      const storageRef = storage.ref()
      const [, type] = avatar.type.split('/')
      const avatarFileRef = storageRef.child(`${user.id}.${type}`)
      await avatarFileRef.put(avatar)
      const avatarUrl = await avatarFileRef.getDownloadURL()
      user.updateUserData({ avatar: avatarUrl })
    }
    await user.updateUserData({ bio })

    setHideTextarea(true)

    history.goBack()
  }, [history, avatar, bio])

  return (
    <Screen>
      <div className={stylesModule.editContainer}>
        <div className={stylesModule.scrollable}>
          <div className={stylesModule.label}>
            <span>
              Please upload a clear photo of your face. Your photo isn't shown
              to people before a date, but it helps them find you afterwards.
            </span>
          </div>

          <PhotoPicker
            onChangeFile={fileChangeHandler}
            defaultPreview={user.avatar}
          />

          <div className={stylesModule.label}>
            <span>
              Tell the person you're about to meet something about yourself.
            </span>
          </div>
          {!hideTextarea && (
            <IonTextarea
              onIonChange={bioChangeHandler}
              value={bio}
              autoGrow
              placeholder="Enter Text"
              className={stylesModule.textareaInput}
            />
          )}
        </div>

        <div className={stylesModule.buttonWrapper}>
          <AppButton
            full
            onClick={doneHandler}
            color="primary"
            loading={loading}
          >
            Done
          </AppButton>
        </div>
      </div>
    </Screen>
  )
}
