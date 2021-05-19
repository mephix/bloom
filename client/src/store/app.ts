import { makeAutoObservable } from 'mobx'
import { db, PARAMETERS_COLLECTION } from '../firebase'
import { FACE_DISPLAY, PARAMS } from './utils/constants'
import { StringDictionary } from './utils/types'

export type AppState = 'WAITING' | 'VIDEO' | 'RATING' | null

class App {
  state: AppState = null
  params: StringDictionary = PARAMS
  faceDisplay: string = ''
  constructor() {
    makeAutoObservable(this)
  }

  async initParams() {
    for (const [, param] of Object.entries(PARAMS)) {
      const doc = await db.collection(PARAMETERS_COLLECTION).doc(param).get()
      this.setParams(param, doc?.data()?.text)
    }
    const fdDoc = await db
      .collection(PARAMETERS_COLLECTION)
      .doc(FACE_DISPLAY)
      .get()
    const fd = fdDoc.data()?.params
    this.setFaceDisplay(fd || '')
  }

  setParams(param: string, value: string) {
    this.params[param] = value
  }

  setFaceDisplay(fd: string) {
    this.faceDisplay = fd
  }

  setWaitingRoomState() {
    this.state = 'WAITING'
  }

  setVideoState() {
    this.state = 'VIDEO'
  }

  setRaitingState() {
    this.state = 'RATING'
  }
}

export default new App()
