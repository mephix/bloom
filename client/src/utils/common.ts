import { DocumentData, DocumentSnapshot } from '../firebase'

export const px = (num: number) => `${num}px`
export const noop = () => {}
export const classes = (...args: string[]) => args.join(' ')
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
