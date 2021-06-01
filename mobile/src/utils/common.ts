import { DocumentData, DocumentSnapshot } from '../firebaseService'
import classnames from 'classnames'

export const px = (num: number) => `${num}px`
export const noop = () => {}
export const classes = classnames
export const computeData = (doc: DocumentSnapshot) => {
  return { ...doc.data(), id: doc.id }
}

export const byActive = (doc: DocumentData) => {
  return !!doc.data()?.active
}

export const byAccepted = (state: boolean) => {
  return (doc: DocumentData) => {
    return !!doc.data()?.accepted === state
  }
}

export const byFor = (email: string) => {
  return (doc: DocumentData) => {
    return doc.data()?.for === email
  }
}

export const isProd = process.env.NODE_ENV === 'production'
