import { useIonAlert } from '@ionic/react'
import { useErrorToast } from 'hooks/error.toast.hook'
import { useInfoToast } from 'hooks/info.toast.hook'
import { observer } from 'mobx-react-lite'
import { LoaderPage } from 'pages/LoaderPage'
import { FC, useCallback, useMemo, useState } from 'react'
import { PhoneNumberService } from 'services/phoneNumber.service'
import matches from 'state/matches'
import { MatchType } from 'state/utils/types'
import { classes } from 'utils'
import { Screen } from 'wrappers/Screen'
import stylesModule from './Matches.module.scss'
import { UserBlock } from './UserBlock'
import copy from 'copy-to-clipboard'
import { useHistory } from 'react-router'
import { User } from '../WaitingRoom/screens/WaitingRoom/WaitingRoom.type'

type MatchesSections = 'recent' | 'matches'

interface MatchesListProps {
  setUserProfile: (user: User) => void
}

export const MatchesList: FC<MatchesListProps> = observer(
  ({ setUserProfile }) => {
    const showError = useErrorToast()
    const [showInfo] = useInfoToast()

    const [section, setSection] = useState<MatchesSections>('recent')
    const allUsers = matches.matchesUsers
    const [present] = useIonAlert()

    const history = useHistory()

    const matchesUsers = useMemo(
      () => allUsers.filter(user => user.type === 'both'),
      [allUsers]
    )

    const actionHandler = useCallback(
      async (userId: string, dateId: string, type: MatchType) => {
        switch (type) {
          case 'both': {
            const phoneNumber = await PhoneNumberService.getUserPhoneNumber(
              userId
            )
            if (!phoneNumber)
              return showError(
                'Opps.. there was an error while getting the phone number'
              )
            copy(phoneNumber)
            showInfo(`Phone number ${phoneNumber} copied to clipboard`)
            break
          }
          case 'unknown': {
            showInfo('Sending your heart 💕')
            matches.setHeart(dateId)
          }
        }
      },
      [showError, showInfo]
    )
    const blockHandler = useCallback(
      (dateId, name) => {
        present(`Are you sure you want to permanently unmatch with ${name}?`, [
          { text: 'Cancel' },
          {
            text: 'Yes',
            handler: () => matches.blockDate(dateId)
          }
        ])
      },
      [present]
    )

    if (matches.loading) return <LoaderPage header color="light" />
    const users = section === 'recent' ? allUsers : matchesUsers

    return (
      <Screen header>
        <div className={stylesModule.sectionsContainer}>
          <div
            onClick={() => setSection('recent')}
            className={classes(stylesModule.section, {
              [stylesModule.selected]: section === 'recent'
            })}
          >
            <span>Recent dates</span>
          </div>
          <div
            onClick={() => setSection('matches')}
            className={classes(stylesModule.section, {
              [stylesModule.selected]: section === 'matches'
            })}
          >
            <span>Matches</span>
          </div>
        </div>

        <div className={stylesModule.usersBlockContainer}>
          {users.map(user => (
            <UserBlock
              onClick={() => {
                setUserProfile({
                  name: user.firstName,
                  bio: user.bio,
                  avatar: user.avatar
                })
                history.push('/matches/profile')
              }}
              key={user.dateId}
              name={user.firstName}
              avatar={user.avatar}
              bio={user.bio}
              type={user.type}
              onAction={type => actionHandler(user.userId, user.dateId, type)}
              onBlock={() => blockHandler(user.dateId, user.firstName)}
            />
          ))}
        </div>
      </Screen>
    )
  }
)
