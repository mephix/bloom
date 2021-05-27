import { FC } from 'react'
import { IconProps } from '../IconToggle.type'
import { px } from '../../../utils/common'
import stylesModule from '../IconToggle.module.scss'

export const HeartIcon: FC<IconProps> = ({ filled = false, size = 40 }) => {
  const color = filled ? '#D74548' : '#999999'
  return (
    <div className={stylesModule.centerIcon}>
      <svg
        style={{
          width: px(size),
          height: px(size)
        }}
        width="24"
        height="24"
        viewBox="0 0 121 112"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {filled && (
          <path
            d="M59.5 16.5L37.5 8.5L36 9.5L16 14.5L6.5 46L59.5 103L114 43L106.5 16.5L81 6L59.5 16.5Z"
            fill={color}
          />
        )}
        <path
          d="M60.5061 9.36272C74.698 -3.37915 96.6292 -2.95623 110.301 10.7402C123.968 24.4427 124.439 46.2652 111.727 60.4994L60.494 111.805L9.27276 60.4994C-3.43891 46.2652 -2.96162 24.4065 10.6986 10.7402C24.383 -2.93811 46.2719 -3.39728 60.5061 9.36272ZM101.746 19.2771C92.684 10.2025 78.0632 9.83398 68.5778 18.3527L60.5121 25.5906L52.4405 18.3588C42.9248 9.82793 28.3342 10.2025 19.2475 19.2892C10.2455 28.2913 9.79234 42.7006 18.0875 52.2223L60.5 94.7013L102.913 52.2284C111.214 42.7006 110.761 28.3094 101.746 19.2771Z"
          fill={color}
        />
      </svg>
    </div>
  )
}
