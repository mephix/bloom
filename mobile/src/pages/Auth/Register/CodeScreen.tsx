import { AppButton } from 'components/AppButton'
import { AppInput } from 'components/AppInput'
import { db, USERS_COLLECTION } from 'firebaseService'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import user from 'state/user'
import { Screen } from 'wrappers/Screen'
import stylesModule from '../AuthIndex.module.scss'
import { RegisterContext } from './RegisterContext'

export const CodeScreen = () => {
  const context = useContext(RegisterContext)
  const history = useHistory()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!context.confirmationResult) return history.replace('/register')
  }, [history, context])
  const checkCodeHandler = useCallback(async () => {
    if (!context.confirmationResult) return history.replace('/register')
    setLoading(true)
    const result = await context.confirmationResult.confirm(code)
    const userId = result.user?.uid!
    const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get()
    const userData = userDoc.data()
    if (userData) return user.setAuth('authorized')
    user.setId(userId)
    history.push('/register/get-info')
  }, [context, history, code])
  return (
    <Screen>
      <div className={stylesModule.container}>
        <AppInput
          value={code}
          onChangeText={text => {
            const num = parseInt(text)
            if (!num && num !== 0) return setCode('')
            setCode(text)
          }}
          label={`The code has been sent to ${context.phone}`}
        />
        <AppButton loading={loading} onClick={checkCodeHandler} color="primary">
          Check
        </AppButton>
      </div>
    </Screen>
  )
}
