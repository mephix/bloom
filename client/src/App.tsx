import { useInit } from './hooks/init.hook'
import { Screen } from './screens'
import './scss/App.scss'

export const App = () => {
  useInit()
  return (
    <>
      <Screen />
    </>
  )
}
