import { useIonAlert } from '@ionic/react'
import { useErrorToast } from 'hooks/error.toast.hook'
import { useInfoToast } from 'hooks/info.toast.hook'
import { observer } from 'mobx-react-lite'
import { LoaderPage } from 'pages/LoaderPage'
import { useCallback, useMemo, useState } from 'react'
import { PhoneNumberService } from 'services/phoneNumber.service'
import matches from 'state/matches'
import { MatchType } from 'state/utils/types'
import { classes } from 'utils'
import { Screen } from 'wrappers/Screen'
import stylesModule from './Matches.module.scss'
import { UserBlock } from './UserBlock'

type MatchesSections = 'recent' | 'matches'

export const Matches = observer(() => {
  const showError = useErrorToast()
  const [showInfo] = useInfoToast()

  const [section, setSection] = useState<MatchesSections>('recent')
  const allUsers = matches.matchesUsers
  const [present] = useIonAlert()

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
          showInfo('Phone number ' + phoneNumber)
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
    dateId => {
      // console.log('block', dateId)
      present('Are you sure you want to log out?', [
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

      <div className={stylesModule.usersBlockContauner}>
        {users.map(user => (
          <UserBlock
            key={user.dateId}
            name={user.firstName}
            avatar={user.avatar}
            bio={user.bio}
            type={user.type}
            onAction={type => actionHandler(user.userId, user.dateId, type)}
            onBlock={() => blockHandler(user.dateId)}
          />
        ))}
      </div>
    </Screen>
  )
})
