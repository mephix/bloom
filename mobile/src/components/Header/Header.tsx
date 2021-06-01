import moduleStyles from './Header.module.scss'

export const Header = () => {
  return (
    <header className={moduleStyles.header}>
      <div className={moduleStyles.logo}>The zero date</div>
    </header>
  )
}
