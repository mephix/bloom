import {
  DetailedHTMLProps,
  FC,
  ImgHTMLAttributes,
  useEffect,
  useRef,
  useState
} from 'react'

export interface AppImageProps
  extends DetailedHTMLProps<
    ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > {
  defaultSrc: string
}

const placeholderSkeleton = {
  background: 'white',
  animation: 'linear 2s infinite blink',
  width: '100%',
  height: '100%',
  borderRadius: '50%'
}

const mountedStyle = {
  // animation: 'inAnimation 250ms ease-in',
  overflow: 'hidden'
}
const unmountedStyle = {
  animation: 'outAnimation 270ms ease-out',
  animationFillMode: 'forwards'
}

export const AppImage: FC<AppImageProps> = ({ defaultSrc, src, ...rest }) => {
  const [loaded, setLoaded] = useState(false)
  const img = useRef<any>(null)

  useEffect(() => {
    setLoaded(false)
    const image = img.current as HTMLImageElement
    image.addEventListener('load', () => {
      setLoaded(true)
    })
  }, [setLoaded, src])
  const styles = loaded ? mountedStyle : unmountedStyle

  return (
    <>
      <div
        style={{
          ...styles,
          display: !loaded ? 'none' : 'inline-block'
        }}
      >
        <img {...rest} ref={img} src={src} alt={rest.alt} />
      </div>

      {!loaded && (
        <div {...rest} style={{ overflow: 'hidden' }}>
          <div style={placeholderSkeleton} />
        </div>
      )}
    </>
  )
}
