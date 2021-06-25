// import { WaitingRoom } from './WaitingRoom'
// import { Video } from './Video'
// import { Raiting } from './Raiting'
// import { NoPermissions } from './NoPermissions'
import { Screen } from 'wrappers/Screen'
// import { NotSafari } from './NotSafari'
import { selectAppState } from 'store/app'
import { useAppSelector } from 'store'
import { Loader, LoaderContainer } from 'components/Loader'
import { Waiting } from './Waiting'

export const WaitingRoom = () => {
  const state = useAppSelector(selectAppState)

  // if (state === 'RATING') return <Raiting />
  // if (state === 'VIDEO') return <Video />
  if (state === 'WAITING')
    return (
      <Screen header color="dark">
        <Waiting />
      </Screen>
    )
  if (state === 'NO_PERMISSIONS')
    return (
      <Screen header color="dark">
        {/* <NoPermissions /> */}
      </Screen>
    )
  if (state === 'NOT_SAFARI')
    return (
      <Screen header color="dark">
        {/* <NotSafari /> */}
      </Screen>
    )
  return (
    <Screen header color="dark">
      <LoaderContainer>
        <Loader />
      </LoaderContainer>
    </Screen>
  )
}
