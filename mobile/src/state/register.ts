import { ConfirmationResult } from 'firebaseService'
import { makeAutoObservable } from 'mobx'

class Register {
  confirmationResult: null | ConfirmationResult = null
  phone: string = ''
  restoreUser: any = null
  constructor() {
    makeAutoObservable(this)
  }
  setConfirmationResult(result: ConfirmationResult) {
    this.confirmationResult = result
  }
  setPhone(phone: string) {
    this.phone = phone
  }
  setRestoreUser(restoreUser: any) {
    this.restoreUser = restoreUser
  }
}

export default new Register()
