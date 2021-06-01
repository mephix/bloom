import { IonTextarea } from '@ionic/react'
import { AppButton } from 'components/AppButton'
import { PhotoPicker } from 'components/PhotoPicker'
import { useCallback, useState } from 'react'
import { useHistory } from 'react-router'
import { Screen } from 'wrappers/Screen'
import stylesModule from './Profile.module.scss'

export const EditScreen = () => {
  const [hideTextarea, setHideTextarea] = useState(false)
  const history = useHistory()

  const doneHandler = useCallback(() => {
    setHideTextarea(true)
    history.goBack()
  }, [history])

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

          <PhotoPicker />

          <div className={stylesModule.label}>
            <span>
              Tell the person you're about to meet something about yourself.
            </span>
          </div>
          {!hideTextarea && (
            <IonTextarea
              autoGrow
              placeholder="Enter Text"
              className={stylesModule.textareaInput}
            />
          )}
        </div>

        <div className={stylesModule.buttonWrapper}>
          <AppButton full onClick={doneHandler} color="primary">
            Done
          </AppButton>
        </div>
      </div>
    </Screen>
  )
}
