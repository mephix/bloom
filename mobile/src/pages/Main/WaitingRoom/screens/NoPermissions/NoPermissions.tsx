import commonStyles from '../Common.module.scss'

export const NoPermissions = () => {
  return (
    <div className={commonStyles.container}>
      <p>Oops, please check permissions :(</p>
      <p style={{ textAlign: 'center', padding: '0 30px' }}>
        This app needs access to your microphone and camera to work correctly
      </p>
    </div>
  )
}
