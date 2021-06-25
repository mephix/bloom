import { AppButton } from 'components/AppButton'
import { AppInput } from 'components/AppInput'
import { useCallback, useState } from 'react'
import { FirebaseAuthentication } from '@ionic-native/firebase-authentication'
import { Screen } from 'wrappers/Screen'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { auth } from 'firebaseService'
import stylesModule from '../AuthIndex.module.scss'
import { useHistory } from 'react-router'
import { useErrorToast } from 'hooks/error.toast.hook'
import register from 'state/register'
import { isPlatform } from '@ionic/react'
import { onEnterKey } from 'utils'

const SEND_CODE_BUTTON_ID = 'send-code'

export const PhoneNumberScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('+1')
  const [loading, setLoading] = useState(false)
  const showError = useErrorToast()
  const history = useHistory()

  const sendCodeHandler = useCallback(async () => {
    try {
      if (!phoneNumber || !isValidPhoneNumber(phoneNumber))
        return showError('Invalid phone number!')
      setLoading(true)

      if (isPlatform('hybrid') && !isPlatform('android')) {
        console.log('hybrid auth')
        const verificationId = await FirebaseAuthentication.verifyPhoneNumber(
          phoneNumber,
          0
        )
        register.setVerifictionId(verificationId)
      } else {
        console.log('web auth')
        const { recapchaVerifier } = verifyWithRecaptcha()
        const confirmationResult = await auth().signInWithPhoneNumber(
          phoneNumber,
          recapchaVerifier
        )
        register.setConfirmationResult(confirmationResult)
      }
      register.setPhone(phoneNumber)
      history.replace('/register/code')
    } catch (err) {
      setLoading(false)
      showError('Oops, something went wrong. Try again later!')
      console.error('auth error', err)
    }
  }, [phoneNumber, showError, history])

  return (
    <Screen>
      <div className={stylesModule.container}>
        <AppInput
          value={phoneNumber}
          onChangeText={phone => setPhoneNumber(phone)}
          onKeyPress={onEnterKey(() => sendCodeHandler())}
          label="What's your phone number?"
          small="We will send you a text with a verification code."
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
    size: 'invisible'
  })

  return { recapchaVerifier }
}
