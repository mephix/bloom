import stylesModule from './PhotoPicker.module.scss'
import placeholderImage from 'assets/images/placeholder.jpg'
import { FC, useCallback, useRef, useState } from 'react'
import { noop } from 'utils'

interface PhotoPickerProps {
  onChangeFile?: (file: File) => void
  defaultPreview?: string
}

export const PhotoPicker: FC<PhotoPickerProps> = ({
  onChangeFile = noop,
  defaultPreview
}) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState(
    defaultPreview || placeholderImage
  )

  const selectFileHandler = useCallback(() => {
    const file = fileRef.current!.files?.[0]

    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
      onChangeFile(file)
    }
  }, [onChangeFile])

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
