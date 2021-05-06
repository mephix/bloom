import { makeAutoObservable } from 'mobx'
import { db } from '../firebase'
import app from './app'
import meetup from './meetup'
import { DocumentSnapshot, UserState } from './utils/types'
import { USERS_COLLECTION } from './utils/constants'

type UpdateUserProps = {
  here?: boolean
  free?: boolean
  name?: string
  finished?: boolean
  email?: string
}

class User {
  email: string | null = null
  name: string | null = null

  here = false
  free = true
  hiddenHere = false
  finished = false

  constructor() {
    makeAutoObservable(this)
  }

  async setEmail(email: string) {
    const userRef = await db.collection(USERS_COLLECTION).doc(email).get()
    const user = userRef.data()
    if (!user) return console.error('User not found')
    this.updateUser({
      here: user.here,
      name: user.firstName,
      email: user.email,
      finished: user.finished,
      free: user.free
    })
    this.subscribeOnMe()
    this.updateUserState({ free: true, here: this.here })
    app.setWaitingRoomState()
    meetup.subscribeOnDates()
    meetup.subscribeOnProspects()
  }

  updateUser({ here, name, email, finished, free }: UpdateUserProps) {
    if (typeof email === 'string') this.email = email
    if (typeof here === 'boolean') this.here = this.hiddenHere = here
    if (typeof name === 'string') this.name = name
    if (typeof finished === 'boolean') this.finished = finished
    if (typeof free === 'boolean') this.free = free
  }

  setHere(state: boolean) {
    this.hiddenHere = this.here = state
    if (this.here) meetup.checkForAvailability()
    this.updateUserState({ here: this.here })
  }

  setHiddenHere(state: boolean) {
    if (state && !this.here) return
    this.hiddenHere = state
    if (this.hiddenHere) meetup.checkForAvailability()
    this.updateUserState({ here: this.hiddenHere })
  }

  setFree(state: boolean) {
    this.free = state
    this.updateUserState({ free: this.free })
  }

  subscribeOnMe() {
    if (!this.email) return
    const onUser = async (userDoc: DocumentSnapshot) => {
      const user = userDoc.data()
      if (!user) return
      this.updateUser({
        here: user.here,
        name: user.firstName,
        email: user.email,
        finished: user.finished,
        free: user.free
      })
      if (user.finished) this.updateUserState({ here: false })
    }
    db.collection(USERS_COLLECTION).doc(this.email).onSnapshot(onUser)
  }

  async updateUserState(state: UserState) {
    if (this.email)
      await db.collection(USERS_COLLECTION).doc(this.email).update(state)
  }
}

export default new User()
