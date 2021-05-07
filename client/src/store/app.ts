import { makeAutoObservable } from 'mobx'
import { db } from '../firebase'
import meetup from './meetup'
import { PARAMETERS_COLLECTION, PARAMS } from './utils/constants'
import { StringDictionary } from './utils/types'

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
      this.setParams(param, doc?.data()?.text)
    }
  }

  resetCountDown() {
    meetup.resetCurrentMatchingUser()
    this.setWaitingRoomState()
  }

  setParams(param: string, value: string) {
    this.params[param] = value
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
