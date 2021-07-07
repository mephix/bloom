import { AppButton } from 'components/AppButton'
import { AppInput } from 'components/AppInput'
import { AppRadio } from 'components/AppRadio'
import { useCallback, useState } from 'react'
import { useHistory } from 'react-router'
import { UserService } from 'services/user.service'
import { useAppSelector } from 'store'
import { selectUserData } from 'store/user'
import { Gender } from 'store/user/types'
import { Screen } from 'wrappers/Screen'
import { ButtonWrapper, EditContainer } from './styled'

export const OptionsScreen = () => {
  const user = useAppSelector(selectUserData)
  const history = useHistory()
  const [gender, setGender] = useState<Gender>(user.genderPreference)
  const [ageRange] = useState({
    lower: user.agePreferences.low,
    upper: user.agePreferences.high
  })
  const [loading, setLoading] = useState(false)

  const doneHandler = useCallback(async () => {
    setLoading(true)
    await UserService.updateUserData({
      genderPreference: gender,
      agePreferences: { low: ageRange.lower, high: ageRange.upper }
    })
    history.goBack()
  }, [history, gender, ageRange])

  const genderChangeHandler = useCallback(gender => setGender(gender), [])

  return (
    <Screen fixed>
      <EditContainer>
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
        <ButtonWrapper>
          <AppButton
            full
            onClick={doneHandler}
            loading={loading}
            color="primary"
          >
            Done
          </AppButton>
        </ButtonWrapper>
      </EditContainer>
    </Screen>
  )
}
