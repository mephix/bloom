import { CSSProperties, FC } from 'react'
import moduleStyles from './Loader.module.scss'

const colorStyle = (color: string): CSSProperties => ({
  borderColor: `${color} transparent transparent transparent`
})

interface LoaderProps {
  color?: string
}

export const Loader: FC<LoaderProps> = ({ color = '#fff' }) => (
  <div className={moduleStyles.container}>
    <div className={moduleStyles['lds-ring']}>
      <div style={colorStyle(color)}></div>
      <div style={colorStyle(color)}></div>
      <div style={colorStyle(color)}></div>
      <div style={colorStyle(color)}></div>
    </div>
  </div>
)
