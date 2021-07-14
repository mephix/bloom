import { FirebaseService } from 'firebaseService'
import {
  RESTORE_USERS_COLLECTION,
  USERS_COLLECTION,
  USER_EVENTS_COLLECTION,
  USER_STATUSES_COLLECTION
} from 'firebaseService/constants'
import { DocumentData, Timestamp } from 'firebaseService/types'
import { store } from 'store'
import { setCards, setCurrentDate, setMatches } from 'store/meetup'
import { setFinished, setFree, setHere, updateUserData } from 'store/user'
import { Ages, Gender } from 'store/user/types'
// import difference from 'lodash/difference'
import equal from 'fast-deep-equal'
import { UserMatch } from './matches.service/types'
import { Logger } from 'utils'
import { ImageService } from './image.service'
// import store from 'store'

const ENTITY_NOT_FOUND_ERROR = 'Requested entity was not found.'

const logger = new Logger('EventsSubscription', '#bdb70f')

interface InitUser {
  firstName: string
  age: number
  gender: string
}

interface UserDataUpdate {
  bio?: string
  socialMedia?: string
  avatar?: string
  genderPreference?: Gender
  agePreferences?: Ages
  waitStartTime?: Timestamp
}

interface UserStatus {
  free?: boolean
  here?: boolean
  dateWith?: string | null
}

export class UserService {
  static phoneNumber = ''

  static get id() {
    return store.getState().user.id
  }

  static async getUser() {
    const userDoc = await FirebaseService.db
      .collection(USERS_COLLECTION)
      .doc(this.id)
      .get()
    const userData = userDoc.data()
    return userData
  }
  static async createUser(data: InitUser) {
    const userRef = FirebaseService.db.collection(USERS_COLLECTION).doc(this.id)
    await userRef.set({
      ...data,
      created: FirebaseService.time.now()
    })
  }
  static async updateAvatar(image: File): Promise<void> {
    const imageId = await ImageService.upload(image)
    this.updateUserData({ avatar: imageId })
  }

  static updateUserData(data: UserDataUpdate) {
    const { waitStartTime, ...storeUserData } = data
    store.dispatch(updateUserData(storeUserData))
    const updateData = { ...data, waitStartTime }
    if (!waitStartTime) delete updateData.waitStartTime
    return FirebaseService.db
      .collection(USERS_COLLECTION)
      .doc(this.id)
      .update(updateData)
  }

  static setHere(state: boolean) {
    store.dispatch(setHere(state))
    this.updateUserStatus({ here: state })
  }

  static setHiddenHere(state: boolean) {
    const here = store.getState().user.here
    if (state && here) this.updateUserStatus({ here: state })
    else if (!state) this.updateUserStatus({ here: state })
  }

  static setFree(state: boolean) {
    store.dispatch(setFree(state))
    this.updateUserStatus({ free: state })
  }

  static async checkUserCollections() {
    await FirebaseService.functions
      .httpsCallable('checkUserCollections')()
      .catch(err => console.log(err))
  }

  static async updateUserStatus(data: UserStatus) {
    try {
      await FirebaseService.db
        .collection(USER_STATUSES_COLLECTION)
        .doc(this.id)
        .update(data)
    } catch (err) {
      if (err.message === ENTITY_NOT_FOUND_ERROR) {
        await FirebaseService.db
          .collection(USER_STATUSES_COLLECTION)
          .doc(this.id)
          .set({
            here: data.here || true,
            free: true,
            finished: false
          })
        await FirebaseService.db
          .collection(USER_STATUSES_COLLECTION)
          .doc(this.id)
          .update(data)
      } else console.error(err)
    }
  }

  static setWaitStartTime() {
    this.updateUserData({ waitStartTime: FirebaseService.time.now() })
  }

  static subcribeOnEvents() {
    const onEvent = (event: DocumentData) => {
      logger.log(event.data())
      const { date, prospects, matches } = event.data()
      updateDate(date)
      updateCards(prospects)
      updateMatches(matches)
    }
    return FirebaseService.db
      .collection(USER_EVENTS_COLLECTION)
      .doc(this.id)
      .onSnapshot(onEvent)
  }

  static subscribeOnStatus() {
    const onStatus = (event: DocumentData) => {
      const currentFinished = store.getState().user.data.finished
      const { finished } = event.data()
      if (finished !== currentFinished) {
        store.dispatch(setFinished(!!finished))
        if (finished) store.dispatch(setHere(false))
      }
    }
    return FirebaseService.db
      .collection(USER_STATUSES_COLLECTION)
      .doc(this.id)
      .onSnapshot(onStatus)
  }

  static setPhoneNumber(phone: string) {
    this.phoneNumber = phone
  }

  static async saveFcmToken(token: string) {
    const statusRef = FirebaseService.db
      .collection(USER_STATUSES_COLLECTION)
      .doc(this.id)
    const statusDoc = await statusRef.get()
    const status = statusDoc.data()
    if (!status) {
      return statusRef.set({
        here: false,
        free: true,
        finished: false,
        notifications: {
          token
        }
      })
    }
    const notifications = status.notifications
    if (!notifications) return statusRef.update({ notifications: { token } })
    statusRef.update({ notifications: { ...notifications, token } })
  }

  static async tryRestoreUser(): Promise<DocumentData | null> {
    try {
      const restoreUserQuery = await FirebaseService.db
        .collection(RESTORE_USERS_COLLECTION)
        .where('phone', '==', this.phoneNumber)
        .get()
      const [restoreUserDoc] = restoreUserQuery.docs
      if (restoreUserDoc) {
        const restoreUser = restoreUserDoc.data()
        await this.createUser({
          firstName: restoreUser.firstName,
          age: restoreUser.age,
          gender: restoreUser.gender
        })
        return restoreUser
      }
      return null
    } catch (err) {
      return null
    }
  }
}

function updateDate(date: any) {
  const free = store.getState().user.free
  const prevDate = store.getState().meetup.currentDate
  if (!prevDate && !date) return
  if (free) store.dispatch(setCurrentDate(date))
}

function updateCards(cards: any) {
  const prevCards = store.getState().meetup.cards
  const diff = equal(cards, prevCards)
  if (!diff) return store.dispatch(setCards(cards))
}

function updateMatches(matches: UserMatch[]) {
  const prevMatches = store.getState().meetup.matches
  const diff = equal(matches, prevMatches)
  if (!diff) return store.dispatch(setMatches(matches))
}
