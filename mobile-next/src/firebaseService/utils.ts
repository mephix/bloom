import { isPlatform } from "@ionic/react"
import { RegisterState } from "pages/Auth/Register/register.state.hook"
import { USERS_COLLECTION } from "./constants"
import { FirebaseService } from "./init"

export async function fetchUserById(id: string) {
  const userDoc = await FirebaseService.db
    .collection(USERS_COLLECTION)
    .doc(id)
    .get()
  const userData = userDoc.data()
  return userData
}

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
