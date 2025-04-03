import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from '@entities/user';
import { authReducer } from '@features/auth';

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
