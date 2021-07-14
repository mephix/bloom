import { isPlatform } from '@ionic/react'
import { RegisterState } from 'pages/Auth/Register/register.state.hook'
import { FirebaseService } from './init'

export async function authUserByCode(
  register: RegisterState,
  code: string
): Promise<string | null> {
  if (isPlatform('hybrid')) {
    if (!register.verificationId) return null
    const credential = FirebaseService.auth.PhoneAuthProvider.credential(
      register.verificationId,
      code
    )
    const result = await FirebaseService.auth().signInWithCredential(credential)
    return result.user?.uid!
  } else {
    if (!register.confirmationResult) return null
    const result = await register.confirmationResult.confirm(code)
    return result.user?.uid!
  }
}
