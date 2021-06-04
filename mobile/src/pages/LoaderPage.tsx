import { FC } from 'react'
import { Screen } from 'wrappers/Screen'
import { Loader } from './Main/WaitingRoom/screens/Loader/Loader'

interface LoaderPageProps {
  color?: 'dark' | 'light'
  header?: boolean
}

export const LoaderPage: FC<LoaderPageProps> = ({ color = 'dark', header }) => {
  return (
    <Screen header={header} color={color}>
      <Loader color={color === 'dark' ? '#fff' : '#000'} />
    </Screen>
  )
}
