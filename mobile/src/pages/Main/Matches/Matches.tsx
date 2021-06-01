import { useState } from 'react'
import { classes } from 'utils'
import { Screen } from 'wrappers/Screen'
import stylesModule from './Matches.module.scss'
import { UserBlock } from './UserBlock'

type MatchesSections = 'recent' | 'matches'

export const Matches = () => {
  const [section, setSection] = useState<MatchesSections>('recent')

  return (
    <Screen>
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
        <UserBlock name="First Name" bio="some text such as bio" type="date" />
        <UserBlock name="First Name" bio="some text such as bio" type="date" />
        <UserBlock
          name="First Name"
          bio="some text such as bio, some text such as bio, some text such as bio, some text such as bio"
          type="date"
        />
      </div>
    </Screen>
  )
}
