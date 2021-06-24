import { useToast } from 'hooks/toast.hook'
import { FC, useCallback, useState } from 'react'
import { useHistory } from 'react-router'
import { RegisterState } from './register.state.hook'

interface PhoneNumberScreenProps {
  register: RegisterState
}

export const PhoneNumberScreen: FC<PhoneNumberScreenProps> = ({ register }) => {
  const sendCodeHandler = useCallback(async () => {}, [])
  const [loading, setLoading] = useState(false)
  const [showError] = useToast('error')
  const history = useHistory()
}
