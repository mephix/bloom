import { AppButton } from 'components/AppButton'
import { AppInput } from 'components/AppInput'
import { AppRadio } from 'components/AppRadio'
import { db, time, USERS_COLLECTION } from 'firebaseService'
import { DateTime } from 'luxon'
import { useCallback, useState } from 'react'
import user from 'state/user'
import { Screen } from 'wrappers/Screen'
import stylesModule from '../AuthIndex.module.scss'
import { useErrorToast } from './error.toast.hook'

export const GetInfoScreen = () => {
  const showError = useErrorToast()
  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    gender: ''
  })

  const saveHandler = useCallback(async () => {
    console.log(formData.name)
    if (!formData.name) return showError('Enter your name!')
    if (!formData.birthday) return showError('Select your birthday!')
    if (!formData.gender) return showError('Select your gender!')
    const birthdayDate = DateTime.fromISO(formData.birthday)
    const dateOfMajority = DateTime.now().minus({ years: 18 })
    console.log(dateOfMajority.toISODate())
    const difference = dateOfMajority.diff(birthdayDate)
    if (difference.milliseconds < 0)
      return showError('You must be 18 or older to join!')
    if (!user.id) return showError('Unexpected error...')
    const userRef = db.collection(USERS_COLLECTION).doc(user.id)
    await userRef.set({
      name: formData.name,
      birthday: time.fromDate(birthdayDate.toJSDate()),
      gender: formData.gender
    })
    user.setAuth('authorized')
  }, [formData, showError])

  return (
    <Screen>
      <div className={stylesModule.container}>
        <AppInput
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          label="What's your name?"
        />
        <AppInput
          onChangeText={birthday => setFormData({ ...formData, birthday })}
          label="When is your birthday?"
          date
          small="You must be 18 or older to join."
        />
        <AppRadio
          onChange={gender => setFormData({ ...formData, gender })}
          label="What's your gender?"
          values={['m', 'f', 'x']}
        />
        <AppButton onClick={saveHandler} color="primary">
          Save
        </AppButton>
      </div>
    </Screen>
  )
}
