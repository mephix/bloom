import { AppButton } from 'components/AppButton'
import { AppInput } from 'components/AppInput'
import { AppRadio } from 'components/AppRadio'
import { useCallback, useMemo, useState } from 'react'
import { useHistory } from 'react-router'
import user, { Gender } from 'state/user'
import { Screen } from 'wrappers/Screen'
import stylesModule from './Profile.module.scss'

export const OptionsScreen = () => {
  const history = useHistory()
  const [gender, setGender] = useState<Gender>(user.meetGender)
  const [ageRange] = useState({
    lower: user.meetAges.from,
    upper: user.meetAges.to
  })
  const [loading, setLoading] = useState(false)

  const doneHandler = useCallback(async () => {
    setLoading(true)
    await user.updateUserData({
      meetGender: gender,
      meetAges: { from: ageRange.lower, to: ageRange.upper }
    })
    history.goBack()
  }, [history, gender, ageRange])

  const genderChangeHandler = useCallback(gender => setGender(gender), [])

  return (
    <Screen>
      <div className={stylesModule.editContainer}>
        <AppRadio
          label="I'd like to meet people of gender(s)..."
          values={['f', 'm', 'x']}
          defaultValue={gender}
          onChange={genderChangeHandler}
        />
        <AppInput
          label="I'd prefer to meet people between the ages of..."
          range
          onChangeRange={useCallback(
            val => {
              ageRange.lower = val.lower
              ageRange.upper = val.upper
            },
            [ageRange]
          )}
          rangeOptions={{ min: 18, max: 99 }}
          rangeValue={ageRange}
        />
        <div className={stylesModule.buttonWrapper}>
          <AppButton
            full
            onClick={doneHandler}
            loading={loading}
            color="primary"
          >
            Done
          </AppButton>
        </div>
      </div>
    </Screen>
  )
}
