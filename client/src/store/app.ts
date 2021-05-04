import { makeAutoObservable } from 'mobx'
import { db } from '../firebase'
import { PARAMETERS_COLLECTION, PARAMS } from './constants'
import { StringDictionary } from './types'

export type AppState = 'WAITING' | 'COUNTDOWN' | 'VIDEO' | 'RATING' | null

class App {
  state: AppState = null
  params: StringDictionary = PARAMS
  constructor() {
    makeAutoObservable(this)
  }

  async initParams() {
    for (const [, param] of Object.entries(PARAMS)) {
      const doc = await db.collection(PARAMETERS_COLLECTION).doc(param).get()
      this.params[param] = doc?.data()?.text
    }
  }

  setWaitingRoomState() {
    this.state = 'WAITING'
  }

  setCountDownState() {
    this.state = 'COUNTDOWN'
  }

  setVideoState() {
    this.state = 'VIDEO'
  }

  setRaitingState() {
    this.state = 'RATING'
  }
}

export default new App()
