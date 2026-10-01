import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import dashboard from './dashboard-slice';

// wp_dashboard's own store, provided by pages/Dashboard. Independent of the host's store.
export const store = configureStore({
  reducer: { dashboard },
  devTools: import.meta.env.DEV && { name: 'wp_dashboard' },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
