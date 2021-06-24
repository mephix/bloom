import { ConfirmationResult } from 'firebaseService/types'
import { Dispatch, SetStateAction, useState } from 'react'

export interface RegisterState {
  phone: string
  verificationId: string
  confirmationResult: ConfirmationResult | null
  setPhone: Dispatch<SetStateAction<string>>
  setVerificationId: Dispatch<SetStateAction<string>>
  setConfirmationResult: Dispatch<SetStateAction<ConfirmationResult | null>>
}

export const useRegisterState = (): RegisterState => {
  const [phone, setPhone] = useState('')
  const [verificationId, setVerificationId] = useState('')
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null)

  return {
    phone,
    verificationId,
    confirmationResult,
    setPhone,
    setVerificationId,
    setConfirmationResult
  }
}
