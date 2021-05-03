import { makeAutoObservable } from 'mobx'

export type AppState = 'WAITING' | 'COUNTDOWN' | 'VIDEO' | 'RATING' | null

class App {
  state: AppState = null

  constructor() {
    makeAutoObservable(this)
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
