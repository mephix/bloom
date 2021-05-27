import commonStyles from '../Common.module.scss'

export const NoPermissions = () => {
  return (
    <div className={commonStyles.container}>
      <p>Oops, please check permissions :(</p>
      <p>
        This app needs access to your microphone and camera to work correctly
      </p>
    </div>
  )
}
