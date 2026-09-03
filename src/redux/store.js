import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import projectmapSlice from '../slices/projectmapSlice';
import authSlice from './slices/authSlice';

export const store = configureStore({
  reducer: {
    projectmap: projectmapSlice,
    auth: authSlice,
  },
});

setupListeners(store.dispatch);
