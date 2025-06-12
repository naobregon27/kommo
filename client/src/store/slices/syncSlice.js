import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

export const syncContactsWithKommo = createAsyncThunk(
  'sync/syncContacts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/kommo/sync-contacts');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al sincronizar contactos');
    }
  }
);

const syncSlice = createSlice({
  name: 'sync',
  initialState: {
    status: 'idle',
    error: null,
    progress: 0,
    totalContacts: 0,
    processedContacts: 0
  },
  reducers: {
    resetSync: (state) => {
      state.status = 'idle';
      state.error = null;
      state.progress = 0;
      state.processedContacts = 0;
    },
    clearAll: (state) => {
      state.status = 'idle';
      state.error = null;
      state.progress = 0;
      state.totalContacts = 0;
      state.processedContacts = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncContactsWithKommo.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(syncContactsWithKommo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.progress = 100;
        state.totalContacts = action.payload.length;
        state.processedContacts = action.payload.length;
        state.error = null;
      })
      .addCase(syncContactsWithKommo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { resetSync, clearAll } = syncSlice.actions;
export default syncSlice.reducer; 