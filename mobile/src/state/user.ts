import LogRocket from 'logrocket'
import { makeAutoObservable } from 'mobx'
import {
  db,
  DocumentSnapshot,
  time,
  USERS_COLLECTION
} from '../firebaseService'
import { isProd } from '../utils'
import app from './app'
import meetup from './meetup'
import { UserState } from './utils/types'

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
  auth: boolean | null = null

  constructor() {
    makeAutoObservable(this)
  }

  async setUser(email: string) {
    const userRef = await db.collection(USERS_COLLECTION).doc(email).get()
    const user = userRef.data()
    if (!user) throw new Error('User not found')
    if (isProd)
      LogRocket.identify(email, {
        name: user.firstName,
        email: email
      })
    this.updateUser({
      here: user.here,
      name: user.firstName,
      email: user.email,
      finished: user.finished,
      free: user.free
    })
  }

  setAuth(state: boolean) {
    this.auth = state
  }

  signUser() {
    this.subscribeOnMe()
    this.setDateWith(null)
    this.updateUserState({ free: true, here: this.here })
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
    if (this.here) meetup.checkAvailability(() => app.setVideoState())
    this.updateUserState({ here: this.here })
  }

  setHiddenHere(state: boolean) {
    if (state && !this.here) return
    this.hiddenHere = state
    if (this.hiddenHere) meetup.checkAvailability(() => app.setVideoState())
    this.updateUserState({ here: this.hiddenHere })
  }

  setFree(state: boolean) {
    this.free = state
    this.updateUserState({ free: this.free })
  }

  setWaitStartTime() {
    this.updateUserState({ waitStartTime: time.now() })
  }

  setDateWith(email: string | null) {
    this.updateUserState({ dateWith: email })
  }

  subscribeOnMe() {
    if (!this.email) return
    const onUser = async (userDoc: DocumentSnapshot) => {
      const user = userDoc.data()
      if (!user) return
      this.updateUser({
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
