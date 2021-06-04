import { makeAutoObservable } from 'mobx'
import { db, PARAMETERS_COLLECTION } from 'firebaseService'
import { FACE_DISPLAY, PARAMS } from './utils/constants'
import { StringDictionary } from './utils/types'
import { Matchmaker } from 'services/matchmaker.service'

export type AppState = 'WAITING' | 'VIDEO' | 'RATING' | 'NO_PERMISSIONS' | null

class App {
  state: AppState = null
  params: StringDictionary = PARAMS
  faceDisplay: string = ''
  constructor() {
    makeAutoObservable(this)
  }

  init() {
    return new Promise(resolve => {
      db.collection(PARAMETERS_COLLECTION).onSnapshot(async () => {
        await this.getParams()
        await Matchmaker.initialize()
        resolve && resolve(null)
      })
    })
  }

  async getParams() {
    for (const [, param] of Object.entries(PARAMS)) {
      const doc = await db.collection(PARAMETERS_COLLECTION).doc(param).get()
      this.setParams(param, doc?.data()?.text)
    }
  }

  setParams(param: string, value: string) {
    this.params[param] = value
  }

  // setFaceDisplay(fd: string) {
  //   this.faceDisplay = fd
  // }

  setNoPermissionsState() {
    this.state = 'NO_PERMISSIONS'
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
