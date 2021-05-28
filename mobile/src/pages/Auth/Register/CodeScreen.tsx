import { AppButton } from 'components/AppButton'
import { AppInput } from 'components/AppInput'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { Screen } from 'wrappers/Screen'
import stylesModule from '../AuthIndex.module.scss'
import { RegisterContext } from './RegisterContext'

export const CodeScreen = () => {
  const context = useContext(RegisterContext)
  const history = useHistory()
  const [code, setCode] = useState('')
  useEffect(() => {
    if (!context.confirmationResult) return history.replace('/register')
  }, [history, context])
  const checkCodeHandler = useCallback(async () => {
    // if (!context.confirmationResult) return history.replace('/register')
    // const result = await context.confirmationResult.confirm(code)
    // console.log('res', result)
  }, [context, history, code])
  return (
    <Screen>
      <div className={stylesModule.container}>
        <AppInput
          value={code}
          onChangeText={text => {
            const num = parseInt(text)
            if (!num) return setCode('')
            setCode(num.toString())
          }}
          label={`The code has been sent to the phone ${context.phone}`}
        />
        <AppButton onClick={checkCodeHandler} color="primary">
          Check
        </AppButton>
      </div>
    </Screen>
  )
}
