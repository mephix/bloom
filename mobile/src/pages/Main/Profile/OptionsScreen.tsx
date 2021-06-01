import { AppButton } from 'components/AppButton'
import { AppInput } from 'components/AppInput'
import { AppRadio } from 'components/AppRadio'
import { person } from 'ionicons/icons'
import { useCallback } from 'react'
import { useHistory } from 'react-router'
import { Screen } from 'wrappers/Screen'
import stylesModule from './Profile.module.scss'

export const OptionsScreen = () => {
  const history = useHistory()

  const doneHandler = useCallback(() => {
    history.goBack()
  }, [history])

  return (
    <Screen>
      <div className={stylesModule.editContainer}>
        <AppRadio
          label="I'd like to meet people of gender(s)..."
          values={['F', 'M', 'X']}
        />

        <AppInput
          label="I'd prefer to meet people between the ages of..."
          icon={person}
          range
          rangeOptions={{ min: 18, max: 99 }}
        />

        <div className={stylesModule.buttonWrapper}>
          <AppButton full onClick={doneHandler} color="primary">
            Done
          </AppButton>
        </div>
      </div>
    </Screen>
  )
}
