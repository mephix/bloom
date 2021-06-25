import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'store'
import { AppStateType, Params } from './types'

export interface AppState {
  state: AppStateType
  params: typeof Params
}

const initialState: AppState = {
  state: null,
  params: Params
}

export const meetupSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppState: (state, action: PayloadAction<AppStateType>) => {
      state.state = action.payload
    },
    setAppParams: (state, action: PayloadAction<typeof Params>) => {
      state.params = action.payload
    }
  }
})

export const { setAppState, setAppParams } = meetupSlice.actions

export const selectAppState = (state: RootState) => state.app.state
export const selectAppParams = (state: RootState) => state.app.params

export default meetupSlice.reducer
