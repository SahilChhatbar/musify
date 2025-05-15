import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './playerslice';
import { debugMiddleware } from './debugMiddleware';

export const store = configureStore({
  reducer: {
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(debugMiddleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;