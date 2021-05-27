import { AppButton } from 'components/AppButton'
import { AppInput } from 'components/AppInput'
import { useCallback, useContext, useState } from 'react'
import { Screen } from 'wrappers/Screen'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { useIonToast } from '@ionic/react'
import { auth } from 'firebaseService'
import stylesModule from '../AuthIndex.module.scss'
import { RegisterContext } from './RegisterContext'
import { useHistory } from 'react-router'

const SEND_CODE_BUTTON_ID = 'send-code'

export const PhoneNumberScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [present] = useIonToast()
  const context = useContext(RegisterContext)
  const history = useHistory()

  const sendCodeHandler = useCallback(async () => {
    try {
      if (!phoneNumber || !isValidPhoneNumber(phoneNumber))
        return present({
          message: 'Invalid phone number!',
          color: 'danger',
          duration: 3 * 1000,
          position: 'top'
        })
      const { recapchaVerifier } = verifyWithRecaptcha()
      setLoading(true)
      const confirmationResult = await auth().signInWithPhoneNumber(
        phoneNumber,
        recapchaVerifier
      )
      context.confirmationResult = confirmationResult
      context.phone = phoneNumber
      history.push('/register/code')
    } catch {
      setLoading(false)
      present({
        message: 'Oops, something went wrong...',
        color: 'danger',
        duration: 3 * 1000,
        position: 'top'
      })
    }
  }, [phoneNumber, present, context, history])

  return (
    <Screen>
      <div className={stylesModule.container}>
        <AppInput
          value={phoneNumber}
          onChangeText={phone => setPhoneNumber(phone)}
          label="What's your phone number?"
          phone
        />
        <AppButton
          id={SEND_CODE_BUTTON_ID}
          onClick={sendCodeHandler}
          color="primary"
          loading={loading}
        >
          Send code
        </AppButton>
      </div>
    </Screen>
  )
}

const verifyWithRecaptcha = () => {
  const recapchaVerifier = new auth.RecaptchaVerifier(SEND_CODE_BUTTON_ID, {
    size: 'invisible',
    callback: (res: any) => console.log('verified', res)
  })

  return { recapchaVerifier }
}
