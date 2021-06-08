import { AppButton } from 'components/AppButton'
import { AppInput } from 'components/AppInput'
import { useCallback, useContext, useState } from 'react'
import { Screen } from 'wrappers/Screen'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { auth } from 'firebaseService'
import stylesModule from '../AuthIndex.module.scss'
import { useHistory } from 'react-router'
import { useErrorToast } from '../../../hooks/error.toast.hook'
import register from 'state/register'

const SEND_CODE_BUTTON_ID = 'send-code'

export const PhoneNumberScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const showError = useErrorToast()
  // const context = useContext(RegisterContext)
  const history = useHistory()

  const sendCodeHandler = useCallback(async () => {
    try {
      if (!phoneNumber || !isValidPhoneNumber(phoneNumber))
        return showError('Invalid phone number!')
      const { recapchaVerifier } = verifyWithRecaptcha()
      setLoading(true)
      const confirmationResult = await auth().signInWithPhoneNumber(
        phoneNumber,
        recapchaVerifier
      )
      register.setConfirmationResult(confirmationResult)
      register.setPhone(phoneNumber)
      history.push('/register/code')
    } catch {
      setLoading(false)
      showError('Oops, something went wrong. Try again later!')
    }
  }, [phoneNumber, showError, history])

  return (
    <Screen>
      <div className={stylesModule.container}>
        <AppInput
          value={phoneNumber}
          onChangeText={phone => setPhoneNumber(phone)}
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
    size: 'invisible',
    callback: (res: any) => console.log('verified', res)
  })

  return { recapchaVerifier }
}
