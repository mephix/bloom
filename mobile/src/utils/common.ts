import { DocumentData, DocumentSnapshot } from 'firebaseService/types'
// import classnames from 'classnames'
import React from 'react'

export const px = (num: number) => `${num}px`
export const noop = () => {}
// export const classes = classnames
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

export const byFor = (id: string) => {
  return (doc: DocumentData) => {
    return doc.data()?.for === id
  }
}

export const isProd = process.env.NODE_ENV === 'production'

export const onEnterKey = (callback: () => void) => {
  return (event: React.KeyboardEvent<HTMLInputElement>) =>
    event.key === 'Enter' && callback()
}
