import { useToast } from 'hooks/toast.hook'
import { FC, useCallback, useState } from 'react'
import { FirebaseAuthentication } from '@ionic-native/firebase-authentication'
import { useHistory } from 'react-router'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { RegisterState } from './register.state.hook'
import { Screen } from 'wrappers/Screen'
import { AuthContainer } from '../styled'
import { AppInput } from 'components/AppInput'
import { onEnterKey } from 'utils'
import { AppButton } from 'components/AppButton'
import { FirebaseService } from 'firebaseService'
import { isPlatform } from '@ionic/react'
import firebase from 'firebase'
import { useAuthWithoutInfo } from '../AuthIndex'

interface PhoneNumberScreenProps {
  register: RegisterState
}

const SEND_CODE_BUTTON_ID = 'send-code'

export const PhoneNumberScreen: FC<PhoneNumberScreenProps> = ({ register }) => {
  const [phoneNumber, setPhoneNumber] = useState('+1')
  const [loading, setLoading] = useState(false)
  const [showError] = useToast('error')
  const history = useHistory()
  const [recapchaVerifier, setRecapchaVerifier] =
    useState<firebase.auth.RecaptchaVerifier | null>(null)

  useAuthWithoutInfo()

  const getRecaptchaVerifier = useCallback(() => {
    if (recapchaVerifier) return recapchaVerifier
    const createdRecapchaVerifier = createRecaptchaVerifier()
    setRecapchaVerifier(createdRecapchaVerifier)
    return createdRecapchaVerifier
  }, [recapchaVerifier])

  const sendCodeHandler = useCallback(async () => {
    try {
      if (!phoneNumber || !isValidPhoneNumber(phoneNumber))
        return showError('Invalid phone number!')
      setLoading(true)
      await sendVerificationCode(phoneNumber, register, getRecaptchaVerifier)
      history.replace('/register/code')
    } catch (err) {
      setLoading(false)
      showError('Oops, something went wrong. Try again later!')
      console.error('auth error', err)
    }
  }, [phoneNumber, showError, history, register, getRecaptchaVerifier])

  return (
    <Screen>
      <AuthContainer>
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
          loading={loading}
        >
          Send code
        </AppButton>
      </AuthContainer>
    </Screen>
  )
}

async function sendVerificationCode(
  phoneNumber: string,
  register: RegisterState,
  getRecaptchaVerifier: () => firebase.auth.RecaptchaVerifier
) {
  if (isPlatform('hybrid')) {
    const verificationId = await FirebaseAuthentication.verifyPhoneNumber(
      phoneNumber,
      0
    )
    register.setVerificationId(verificationId)
  } else {
    const recapchaVerifier = getRecaptchaVerifier()
    const confirmationResult =
      await FirebaseService.auth().signInWithPhoneNumber(
        phoneNumber,
        recapchaVerifier
      )
    register.setConfirmationResult(confirmationResult)
  }
  register.setPhone(phoneNumber.trim())
}

function createRecaptchaVerifier() {
  const recapchaVerifier = new FirebaseService.auth.RecaptchaVerifier(
    SEND_CODE_BUTTON_ID,
    {
      size: 'invisible'
    }
  )
  return recapchaVerifier
}
