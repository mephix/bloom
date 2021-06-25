import placeholderImage from 'assets/images/placeholder.jpg'
import { FC, useCallback, useRef, useState } from 'react'
import { noop } from 'utils'
import { PickerContainer, PickerImage, UploadPlaceholder } from './styled'

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
    <PickerContainer>
      <PickerImage src={previewUrl} alt="avatar" />
      <UploadPlaceholder>
        <span>Upload</span>
      </UploadPlaceholder>
      <input
        onChange={selectFileHandler}
        ref={fileRef}
        type="file"
        accept="image/*"
      />
    </PickerContainer>
  )
}
