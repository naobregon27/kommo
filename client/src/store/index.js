import { configureStore } from '@reduxjs/toolkit';
import contactsReducer from './slices/contactsSlice';
import syncReducer from './slices/syncSlice';

export const store = configureStore({
  reducer: {
    contacts: contactsReducer,
    sync: syncReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store; 