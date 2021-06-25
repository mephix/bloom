import { createAsyncThunk } from '@reduxjs/toolkit'
import { MatchesService } from 'services/matches.service'
import { setMatches } from '.'

export const fetchMatches = createAsyncThunk(
  'meetup/fetchMatches',
  async (_: unknown, { dispatch, rejectWithValue }) => {
    const matches = await MatchesService.fetchLastMatches()
    dispatch(setMatches(matches))
  }
)
