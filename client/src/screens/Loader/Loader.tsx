import moduleStyles from './Loader.module.scss'

export const Loader = () => (
  <div className={moduleStyles.container}>
    <div className={moduleStyles['lds-ring']}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
)
