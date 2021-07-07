import { AppButton } from 'components/AppButton'
import { AppInput } from 'components/AppInput'
import { AppRadio } from 'components/AppRadio'
import { mapUserToUserData } from 'hooks/auth.hook/utils'
import { useToast } from 'hooks/toast.hook'
import { DateTime } from 'luxon'
import { FC, useCallback, useState } from 'react'
import { PhoneNumberService } from 'services/phone.number.service'
import { UserService } from 'services/user.service'
import { useAppDispatch, useAppSelector } from 'store'
import { selectUserId, setAuth, updateUserData } from 'store/user'
import { Screen } from 'wrappers/Screen'
import { AuthContainer } from '../styled'

const formDataInitial = {
  name: '',
  birthday: '',
  gender: ''
}

export const GetInfoScreen: FC = () => {
  const dispatch = useAppDispatch()
  const [showError] = useToast('error')
  const [formData, setFormData] = useState(formDataInitial)
  const userId = useAppSelector(selectUserId)
  const [loading, setLoading] = useState(false)

  const saveHandler = useCallback(async () => {
    try {
      const [error, user] = validateFormData(formData)
      if (error) return showError(error)
      setLoading(true)
      await UserService.createUser(user!)
      const userData = mapUserToUserData(user)
      dispatch(updateUserData(userData))
      await PhoneNumberService.setupPhoneNumberObject(userId)
      dispatch(setAuth('authorized'))
    } catch (err) {
      setLoading(false)
      showError('Oops.. Something went wrong! Try again later')
      console.error('get info error', err)
    }
  }, [formData, showError, userId, dispatch])

  return (
    <Screen>
      <AuthContainer>
        <AppInput
          onChangeText={birthday => setFormData({ ...formData, birthday })}
          label="When is your birthday?"
          date
          small="You must be 18 or older to join."
        />
        <AppInput
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          label="What's your name?"
        />
        <AppRadio
          onChange={gender => setFormData({ ...formData, gender })}
          label="What's your gender?"
          values={['m', 'f', 'x']}
        />
        <AppButton loading={loading} onClick={saveHandler} color="primary">
          Save
        </AppButton>
      </AuthContainer>
    </Screen>
  )
}

function validateFormData(
  formData: typeof formDataInitial
): [string | null, { firstName: string; age: number; gender: string } | null] {
  if (!formData.name) return ['Enter your name!', null]
  if (!formData.birthday) return ['Select your birthday!', null]
  if (!formData.gender) return ['Select your gender!', null]
  const birthdayDate = DateTime.fromISO(formData.birthday)
  const age = Math.floor(Math.abs(birthdayDate.diffNow('years').years))
  if (age < 18) return ['You must be 18 or older to join!', null]
  return [
    null,
    { firstName: formData.name.trim(), age, gender: formData.gender }
  ]
}
