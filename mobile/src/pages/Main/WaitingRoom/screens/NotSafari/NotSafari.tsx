import commonStyles from '../Common.module.scss'

export const NotSafari = () => {
  return (
    <div className={commonStyles.container}>
      <p>Oops, please use Safari</p>
      <p style={{ textAlign: 'center', padding: '0 30px' }}>
        Apparently you are not using Safari on your iOS device. You need to use
        Safari for some functions to work
      </p>
    </div>
  )
}
