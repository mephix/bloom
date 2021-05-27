import { AppButton } from 'components/AppButton'
import { AppInput } from 'components/AppInput'
import { useCallback, useState } from 'react'
import { Screen } from '../../wrappers/Screen'
import stylesModule from './AuthIndex.module.scss'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { useIonToast } from '@ionic/react'
import { auth, ConfirmationResult } from 'firebaseService'

const SEND_CODE_BUTTON_ID = 'send-code'

export const Register = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [present] = useIonToast()
  const [state] = useState<{ confirmationResult: ConfirmationResult | null }>({
    confirmationResult: null
  })

  const sendCodeHandler = useCallback(async () => {
    if (!phoneNumber || !isValidPhoneNumber(phoneNumber))
      return present({
        message: 'Invalid phone number!',
        color: 'danger',
        duration: 3 * 1000,
        position: 'top'
      })
    // const recapchaVerifier
    const { recapchaVerifier } = verifyWithRecaptcha()
    state.confirmationResult = await auth().signInWithPhoneNumber(
      phoneNumber,
      recapchaVerifier
    )
  }, [phoneNumber, present, state])

  const testHandler = () => {
    console.log(state.confirmationResult)
  }

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
        >
          Send code
        </AppButton>
        <AppButton onClick={testHandler}>test</AppButton>
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
