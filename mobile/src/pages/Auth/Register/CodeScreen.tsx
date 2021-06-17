import { AppButton } from 'components/AppButton'
import { AppInput } from 'components/AppInput'
import {
  auth,
  db,
  RESTORE_USERS_COLLECTION,
  USERS_COLLECTION
} from 'firebaseService'
import { useErrorToast } from 'hooks/error.toast.hook'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import register from 'state/register'
import user from 'state/user'
import { Screen } from 'wrappers/Screen'
import stylesModule from '../AuthIndex.module.scss'
import { isPlatform } from '@ionic/react'
import { onEnterKey } from 'utils'

export const CodeScreen = observer(() => {
  const showError = useErrorToast()
  const history = useHistory()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!register.confirmationResult && !register.verificationId)
      return history.replace('/register')
  }, [history])
  const checkCodeHandler = useCallback(async () => {
    if (!code) return showError('Code is required!')
    setLoading(true)
    try {
      let userId: string = ''
      if (isPlatform('hybrid')) {
        if (!register.verificationId) return history.replace('/register')
        const credential = auth.PhoneAuthProvider.credential(
          register.verificationId,
          code
        )
        const result = await auth().signInWithCredential(credential)
        userId = result.user?.uid!
      } else {
        if (!register.confirmationResult) return history.replace('/register')
        const result = await register.confirmationResult.confirm(code)
        userId = result.user?.uid!
      }
      const userRef = db.collection(USERS_COLLECTION).doc(userId)
      const userDoc = await userRef.get()
      const userData = userDoc.data()
      if (userData) return user.setAuth('authorized')
      const restoreUserQuery = await db
        .collection(RESTORE_USERS_COLLECTION)
        .where('phone', '==', register.phone.trim())
        .get()
      const [restoreUserDoc] = restoreUserQuery.docs
      if (restoreUserDoc) {
        const restoreUser = restoreUserDoc.data()
        await userRef.set({
          firstName: restoreUser.firstName,
          age: restoreUser.age,
          gender: restoreUser.gender
        })
        user.setUser({
          id: userId,
          firstName: restoreUser.firstName
        })
        user.updateUserData({
          bio: restoreUser.bio || '',
          avatar: restoreUser.avatar || '',
          genderPreference: restoreUser.genderPreference,
          agePreferences: restoreUser.agePreferences,
          email: restoreUserDoc.id
        })
        return user.setAuth('authorized')
      }
      user.setId(userId)
      history.replace('/register/get-info')
    } catch {
      showError(
        'Wrong code! Please try again or contact hello@thezerodate.com for help',
        5
      )
      setLoading(false)
    }
  }, [history, code, showError])
  return (
    <Screen>
      <div className={stylesModule.container}>
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
        <AppButton loading={loading} onClick={checkCodeHandler} color="primary">
          Continue
        </AppButton>
      </div>
    </Screen>
  )
})
