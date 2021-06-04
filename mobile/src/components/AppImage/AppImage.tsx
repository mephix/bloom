import {
  DetailedHTMLProps,
  FC,
  ImgHTMLAttributes,
  useEffect,
  useRef,
  useState
} from 'react'

interface AppImageProps
  extends DetailedHTMLProps<
    ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > {
  defaultSrc: string
}

export const AppImage: FC<AppImageProps> = ({ defaultSrc, src, ...rest }) => {
  const [loaded, setLoaded] = useState(false)
  const img = useRef<any>(null)

  useEffect(() => {
    const image = img.current as HTMLImageElement
    image.addEventListener('load', () => {
      setLoaded(true)
    })
  }, [setLoaded])

  return (
    <>
      <img
        ref={img}
        src={src}
        style={{
          display: loaded ? 'inline-flex' : 'none'
        }}
        alt=""
        {...rest}
      />
      <img
        src={defaultSrc}
        {...rest}
        style={{
          display: !loaded ? 'inline-flex' : 'none'
        }}
        alt=""
        {...rest}
      />
    </>
  )
}
