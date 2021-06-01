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

interface UpdateUserProps {
  here?: boolean
  free?: boolean
  finished?: boolean
}

type AuthStatus =
  | 'authorized'
  | 'unauthorized'
  | 'unknown'
  | 'without_information'

interface UserData {
  id: string
  name: string
  bio?: string
  avatar?: string
  here?: boolean
  free?: boolean
  finished?: boolean
}

interface UserDataUpdate {
  bio?: string
  avatar?: string
}

class User {
  id: string | undefined
  email: string | null = null
  name: string = ''
  bio: string = ''
  avatar: string = ''

  here = false
  free = true
  hiddenHere = false
  finished = false

  auth: AuthStatus = 'unknown'

  constructor() {
    makeAutoObservable(this)
  }

  async setId(id: string) {
    this.id = id
  }

  setUser(user: UserData) {
    this.id = user.id
    this.name = user.name
    this.bio = user.bio || ''
    this.avatar = user.avatar || ''

    this.updateUser({
      finished: user.finished
    })
  }

  async setUser_OLD(email: string) {
    const userDoc = await db.collection(USERS_COLLECTION).doc(email).get()
    const user = userDoc.data()
    if (!user) throw new Error('User not found')
    if (isProd)
      LogRocket.identify(email, {
        name: user.firstName,
        email: email
      })
    this.updateUser({
      here: user.here,
      finished: user.finished,
      free: user.free
    })
  }

  setAuth(state: AuthStatus) {
    this.auth = state
  }

  signUser() {
    this.subscribeOnMe()
    this.setDateWith(null)
    this.updateUserState({ free: true, here: this.here })
    meetup.subscribeOnDates()
    meetup.subscribeOnProspects()
  }

  updateUser({ here, finished, free }: UpdateUserProps) {
    if (typeof here === 'boolean') this.here = this.hiddenHere = here
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

  setDateWith(id: string | null) {
    this.updateUserState({ dateWith: id })
  }

  subscribeOnMe() {
    const onUser = async (userDoc: DocumentSnapshot) => {
      const user = userDoc.data()
      if (!user) return
      this.updateUser({
        finished: user.finished,
        free: user.free
      })
      if (user.finished) this.updateUserState({ here: false })
    }
    db.collection(USERS_COLLECTION).doc(this.id).onSnapshot(onUser)
  }

  async updateUserData(user: UserDataUpdate) {
    this.bio = user.bio || this.bio
    this.avatar = user.avatar || this.avatar
    await db.collection(USERS_COLLECTION).doc(this.id).update(user)
  }

  async updateUserState(state: UserState) {
    if (this.email)
      await db.collection(USERS_COLLECTION).doc(this.id).update(state)
  }
}

export default new User()
