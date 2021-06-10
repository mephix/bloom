import { AppButton } from 'components/AppButton'
import { AppInput } from 'components/AppInput'
import { AppRadio } from 'components/AppRadio'
import { db, USERS_COLLECTION } from 'firebaseService'
import { DateTime } from 'luxon'
import { useCallback, useState } from 'react'
import user from 'state/user'
import { Screen } from 'wrappers/Screen'
import stylesModule from '../AuthIndex.module.scss'
import { useErrorToast } from 'hooks/error.toast.hook'
// import { useIonAlert } from '@ionic/react'
// import { useHistory } from 'react-router'
import register from 'state/register'
import { observer } from 'mobx-react-lite'
const formDataInitial = {
  name: '',
  birthday: '',
  gender: ''
}
export const GetInfoScreen = observer(() => {
  const showError = useErrorToast()

  const [formData, setFormData] = useState(formDataInitial)

  //#region Restore Account
  // const [present] = useIonAlert()
  // const history = useHistory()
  // const [restoreUserState, setRestoreUserState] = useState(false)
  const restoreUser = register.restoreUser

  // useEffect(() => {
  // if (!restoreUser && typeof restoreUser !== 'number')
  //   return present({
  //     message: 'Would you like to try to restore your old account?',
  //     buttons: [
  //       { text: "No, I didn't have" },
  //       {
  //         text: 'Yes, let me try!',
  //         handler: () => {
  //           history.push('/register/restore')
  //         }
  //       }
  //     ]
  //   })
  // else if (!restoreUserState) {
  //   setRestoreUserState(true)
  //   setFormData({ ...formDataInitial, name: restoreUser?.firstName || '' })
  // }
  // }, [history, present, restoreUser, restoreUserState])

  //#endregion

  const saveHandler = useCallback(async () => {
    if (!formData.name) return showError('Enter your name!')
    if (!formData.birthday) return showError('Select your birthday!')
    if (!formData.gender) return showError('Select your gender!')
    const birthdayDate = DateTime.fromISO(formData.birthday)
    const age = Math.floor(Math.abs(birthdayDate.diffNow('years').years))
    if (age < 18) return showError('You must be 18 or older to join!')
    if (!user.id) return showError('Unexpected error...')
    const userRef = db.collection(USERS_COLLECTION).doc(user.id)
    await userRef.set({
      firstName: formData.name,
      age: age,
      gender: formData.gender
    })
    user.setUser({
      id: user.id,
      firstName: formData.name
    })
    if (restoreUser) {
      user.updateUserData({
        bio: restoreUser?.bio || '',
        avatar: restoreUser?.face || ''
      })
    }
    user.setAuth('authorized')
  }, [formData, showError, restoreUser])

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
})
