import axios from 'axios'

const API_URL = process.env.REACT_APP_CLOUDINARY_API_URL || ''
const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || ''
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || ''
const FORM_DATA_HEADERS = {
  'Content-Type': 'multipart/form-data'
}
const cloudinaryImageTemplate = (cloud: string) =>
  `https://res.cloudinary.com/${cloud}/image/upload`

export class ImageService {
  static async upload(image: File) {
    const formData = new FormData()
    formData.append('file', image)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('cloud_name', CLOUD_NAME)

    const { data } = await axios.post(API_URL, formData, {
      headers: FORM_DATA_HEADERS
    })
    return data['public_id']
  }
  static transform(image: string, transforms?: string) {
    if (!image) return ''
    if (isUrl(image)) return image
    return transforms
      ? `${cloudinaryImageTemplate(CLOUD_NAME)}/${transforms}/${image}`
      : `${cloudinaryImageTemplate(CLOUD_NAME)}/${image}`
  }
}

const isUrl = (url: string) => {
  return /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/gi.test(
    url
  )
}
