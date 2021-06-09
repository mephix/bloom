import { Card } from 'components/Card'
import { FC, useCallback } from 'react'
import { useHistory } from 'react-router'
import { Screen } from 'wrappers/Screen'
import { User } from 'pages/Main/WaitingRoom/screens/WaitingRoom/WaitingRoom.type'

interface MatchesProfileProps {
  user: User
}

export const MatchesProfile: FC<MatchesProfileProps> = ({user}) => {
  const history = useHistory()

  return (
    <Screen header color="dark">
      <Card
        type="profile"
        user={user}
        buttonText="Back"
        onResolve={useCallback(() => history.goBack(), [history])}
      />
    </Screen>
  )
}
