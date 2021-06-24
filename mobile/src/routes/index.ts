import { useEffect } from 'react'
import { useHistory } from 'react-router'

export * from './AuthRoutes'

export const useReplace = (callback: () => boolean, to: string) => {
  const history = useHistory()
  useEffect(() => {
    if (callback()) history.replace(to)
  }, [history, callback, to])
}
