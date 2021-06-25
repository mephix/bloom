import { Card } from 'components/Card'
import { FC, useCallback } from 'react'
import { useHistory } from 'react-router'
import { Screen } from 'wrappers/Screen'
import { UserInfo } from '.'

interface MatchesProfileProps {
  user: UserInfo
}

export const MatchesProfile: FC<MatchesProfileProps> = ({ user }) => {
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
