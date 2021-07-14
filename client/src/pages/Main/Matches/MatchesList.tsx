import { useIonAlert } from '@ionic/react'
import { useToast } from 'hooks/toast.hook'
import { LoaderPage } from 'pages/LoaderPage'
import { FC, useCallback, useMemo, useState } from 'react'
import { PhoneNumberService } from 'services/phone.number.service'
import { Screen } from 'wrappers/Screen'
import { UserBlock } from './UserBlock'
import { useHistory } from 'react-router'
import { UserInfo } from '.'
import { MatchType } from 'services/matches.service/types'
import { selectMatches, selectMatchesLoading } from 'store/meetup'
import { useAppSelector } from 'store'
import { MatchesService } from 'services/matches.service'
import { Section, SectionsContainer } from './styled'

type MatchesSections = 'recent' | 'matches'

interface MatchesListProps {
  setUserProfile: (user: UserInfo) => void
}

export const MatchesList: FC<MatchesListProps> = ({ setUserProfile }) => {
  const loading = useAppSelector(selectMatchesLoading)
  const allUsers = useAppSelector(selectMatches)
  const [showError] = useToast('error')
  const [showInfo] = useToast('info')

  const [section, setSection] = useState<MatchesSections>('recent')
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
          const contact = await PhoneNumberService.getUserContact(userId)
          if (!contact)
            return showError(
              "Opps.. there was an error while retrieving the user's contact"
            )
          if (contact.type === 'phone') {
            PhoneNumberService.interactWithPhoneNumber(contact.data)
            showInfo(`Phone number ${contact.data} copied to clipboard`)
          } else {
            PhoneNumberService.copy(contact.data)
            showInfo(
              `User contact ${contact.data} has been copied to the clipboard.`
            )
          }

          break
        }
        case 'unknown': {
          showInfo('Sending your heart 💕')
          MatchesService.setHeart(dateId)
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
          handler: () => {
            console.log('block action', dateId)
            MatchesService.blockDate(dateId)
          }
        }
      ])
    },
    [present]
  )

  if (loading) return <LoaderPage header color="light" />
  const users = section === 'recent' ? allUsers : matchesUsers

  return (
    <Screen fixed header>
      <SectionsContainer>
        <Section
          selected={section === 'recent'}
          onClick={() => setSection('recent')}
        >
          <span>Recent dates</span>
        </Section>
        <Section
          selected={section === 'matches'}
          onClick={() => setSection('matches')}
        >
          <span>Matches</span>
        </Section>
      </SectionsContainer>

      <div>
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
