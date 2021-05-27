import { ConfirmationResult } from 'firebaseService'
import { createContext } from 'react'

export const DEFAULT_REGISTER_CONTEXT = {
  confirmationResult: null,
  phone: ''
}

interface RegisterContextObject {
  confirmationResult: null | ConfirmationResult
  phone: string
}

export const RegisterContext = createContext<RegisterContextObject>(
  DEFAULT_REGISTER_CONTEXT
)
