import { useIonAlert } from '@ionic/react'
import { AppButton } from 'components/AppButton'
import { AppInput } from 'components/AppInput'
import { db, OLD_USERS_COLLECTION } from 'firebaseService'
import { useErrorToast } from 'hooks/error.toast.hook'
import { useCallback, useState } from 'react'
import { useHistory } from 'react-router'
import register from 'state/register'
import { Screen } from 'wrappers/Screen'
import stylesModule from '../AuthIndex.module.scss'
// import { RegisterContext } from './RegisterContext'

export const RestoreAccount = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const showError = useErrorToast()
  const [present] = useIonAlert()
  const history = useHistory()
  // let context = useContext(RegisterContext)

  const confirmHandler = async () => {
    if (!email) return showError('Email is required!')
    setLoading(true)
    const userDoc = await db.collection(OLD_USERS_COLLECTION).doc(email).get()
    const user = userDoc.data()
    if (!user) {
      setLoading(false)

      return present("Oops, we didn't find a user with a similar email", [
        { text: 'Try again' },
        {
          text: 'I give up',
          handler: () => {
            register.setRestoreUser(0)
            history.push('/register/get-info')
          }
        }
      ])
    }
    setLoading(false)
    // context.restoreUser = user
    // context = { ...context, restoreUser: user }
    register.setRestoreUser(user)
    history.push('/register/get-info')
  }
  return (
    <Screen>
      <div className={stylesModule.container}>
        <AppInput
          value={email}
          onChangeText={useCallback(text => setEmail(text), [])}
          label={'Enter your email'}
        />
        <AppButton loading={loading} onClick={confirmHandler} color="primary">
          Confirm
        </AppButton>
      </div>
    </Screen>
  )
}
