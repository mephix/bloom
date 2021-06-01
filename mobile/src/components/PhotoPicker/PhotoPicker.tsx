import stylesModule from './PhotoPicker.module.scss'
import placeholderImage from 'assets/images/placeholder.jpg'
import { useCallback, useRef, useState } from 'react'

export const PhotoPicker = () => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState(placeholderImage)

  const selectFileHandler = useCallback(() => {
    const file = fileRef.current!.files?.[0]

    if (file) setPreviewUrl(URL.createObjectURL(file))
  }, [])

  return (
    <label className={stylesModule.picker}>
      <img className={stylesModule.image} src={previewUrl} alt="avatar" />
      <div className={stylesModule.uploadPlaceholder}>
        <span>Upload</span>
      </div>
      <input
        onChange={selectFileHandler}
        ref={fileRef}
        type="file"
        accept="image/*"
      />
    </label>
  )
}
