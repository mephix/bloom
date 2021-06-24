import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'store'
import { AuthStatus, UserData } from './types'

export interface UserState {
  id: string
  auth: AuthStatus
  here: boolean
  free: boolean
  data: UserData
}

export const userDataDefaults: UserData = {
  firstName: '',
  bio: '',
  avatar: '',
  finished: false,
  genderPreference: '',
  agePreferences: { low: 18, high: 99 }
}

const initialState: UserState = {
  id: '',
  auth: 'unknown',
  here: false,
  free: true,
  data: userDataDefaults
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setId: (state, { payload }: PayloadAction<string>) => {
      state.id = payload
    },
    setUserData: (state, { payload }: PayloadAction<UserData>) => {
      state.data = { ...payload }
    },
    setAuth: (state, { payload }: PayloadAction<AuthStatus>) => {
      state.auth = payload
    }
  }
})

export const selectAuth = (state: RootState) => state.user.auth
export const selectUserId = (state: RootState) => state.user.id

export const { setId, setUserData, setAuth } = userSlice.actions

export default userSlice.reducer
