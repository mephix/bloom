import { FC } from 'react'
import { IconProps } from '../IconToggle.type'
import { px } from '../../../utils'
import stylesModule from '../IconToggle.module.scss'

export const DislikeIcon: FC<IconProps> = ({ filled = false, size = 40 }) => {
  const color = filled ? '#25D8B2' : '#999999'
  return (
    <div className={stylesModule.centerIcon}>
      <svg
        version="1.1"
        id="Capa_1"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        style={{
          width: px(size),
          height: px(size)
        }}
        viewBox="0 0 469.333 469.333"
      >
        <rect x="384" y="21.333" width="85.333" height="256" fill={color} />
        <path
          d="M298.667,21.333h-192c-17.707,0-32.853,10.773-39.253,26.027l-64.32,150.4C1.173,202.667,0,207.893,0,213.333v40.853
				l0.213,0.213L0,256c0,23.573,19.093,42.667,42.667,42.667h134.72l-20.373,97.493c-0.427,2.133-0.747,4.373-0.747,6.72
				c0,8.853,3.627,16.853,9.387,22.613L188.373,448l140.48-140.48c7.68-7.787,12.48-18.453,12.48-30.187V64
				C341.333,40.427,322.24,21.333,298.667,21.333z"
          fill={color}
        />
      </svg>
    </div>
  )
}
