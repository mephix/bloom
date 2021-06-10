import { AppButton } from 'components/AppButton'
import { AppInput } from 'components/AppInput'
import { db, RESTORE_USERS_COLLECTION, USERS_COLLECTION } from 'firebaseService'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import register from 'state/register'
import user from 'state/user'
import { Screen } from 'wrappers/Screen'
import stylesModule from '../AuthIndex.module.scss'

export const CodeScreen = observer(() => {
  // const context = useContext(RegisterContext)
  const history = useHistory()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!register.confirmationResult) return history.replace('/register')
  }, [history])
  const checkCodeHandler = useCallback(async () => {
    if (!register.confirmationResult) return history.replace('/register')
    setLoading(true)
    const result = await register.confirmationResult.confirm(code)
    const userId = result.user?.uid!
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
        agePreferences: restoreUser.agePreferences
      })
      return user.setAuth('authorized')
    }
    // console.log('query', restoreUserQuery.docs)
    user.setId(userId)
    history.push('/register/get-info')
  }, [history, code])
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
          label={`The code has been sent to ${register.phone}`}
        />
        <AppButton loading={loading} onClick={checkCodeHandler} color="primary">
          Check
        </AppButton>
      </div>
    </Screen>
  )
})
