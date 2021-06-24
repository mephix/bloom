import { AppButton } from 'components/AppButton'
import { AppInput } from 'components/AppInput/AppInput'
import { authUserByCode } from 'firebaseService/utils'
import { useToast } from 'hooks/toast.hook'
import { FC, useCallback, useState } from 'react'

import { onEnterKey } from 'utils'
import { Screen } from 'wrappers/Screen'
import { AuthContainer } from '../styled'
import { RegisterState } from './register.state.hook'

interface CodeScreenProps {
  register: RegisterState
}

export const CodeScreen: FC<CodeScreenProps> = ({ register }) => {
  const [showError] = useToast('error')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const checkCodeHandler = useCallback(() => {
    setLoading(true)
    authUserByCode(register, code).catch(() => {
      showError(
        'Wrong code! Please try again or contact hello@thezerodate.com for help',
        5
      )
      setLoading(false)
    })
  }, [code, register, showError])

  return (
    <Screen>
      <AuthContainer>
        <AppInput
          autoFocus={true}
          value={code}
          onChangeText={text => {
            const num = parseInt(text)
            if (!num && num !== 0) return setCode('')
            setCode(text)
          }}
          onKeyPress={onEnterKey(() => checkCodeHandler())}
          label={`Enter the code sent to ${register.phone} below`}
          type="number"
          pattern="[0-9]*"
        />
        <AppButton loading={loading} onClick={checkCodeHandler}>
          Continue
        </AppButton>
      </AuthContainer>
    </Screen>
  )
}
