import { FC, useEffect } from 'react'
import { useHistory } from 'react-router'
import user from 'state/user'
import { classes } from 'utils'
import { AppButton } from '../../components/AppButton'
import { Screen } from '../../wrappers/Screen'
import stylesModule from './AuthIndex.module.scss'

export const AuthIndex: FC = () => {
  const history = useHistory()
  useEffect(() => {
    if (user.auth === 'without_information')
      history.replace('/register/get-info')
  }, [history])
  return (
    <Screen color="dark">
      <div className={stylesModule.image}></div>
      <div className={classes(stylesModule.container, stylesModule.index)}>
        <AppButton
          onClick={() => history.push('/register')}
          color="primary"
          full
          style={{ marginBottom: '60px', minHeight: '42px' }}
        >
          Let's go
        </AppButton>
      </div>
    </Screen>
  )
}
