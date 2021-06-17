import { makeAutoObservable } from 'mobx'
import { db, PARAMETERS_COLLECTION } from 'firebaseService'
import { PARAMS } from './utils/constants'
import { StringDictionary } from './utils/types'
import { Matchmaker } from 'services/matchmaker.service'
import { Logger } from 'utils'

export type AppState =
  | 'WAITING'
  | 'VIDEO'
  | 'RATING'
  | 'NO_PERMISSIONS'
  | 'NOT_SAFARI'
  | null

const logger = new Logger('AppState', '#2e2b24')

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
        logger.log('Get settings params')
        await this.getParams()
        logger.log('Start initializing Matchmaker')
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

  setNoPermissionsState() {
    logger.log('Set NO_PERMISSIONS state')

    this.state = 'NO_PERMISSIONS'
  }

  setNotSafariState() {
    logger.log('Set NOT_SAFARI state')

    this.state = 'NOT_SAFARI'
  }

  setWaitingRoomState() {
    logger.log('Set WAITING state')

    this.state = 'WAITING'
  }

  setVideoState() {
    logger.log('Set VIDEO state')

    this.state = 'VIDEO'
  }

  setRaitingState() {
    logger.log('Set RATING state')

    this.state = 'RATING'
  }
}

export default new App()
