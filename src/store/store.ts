import { configureStore } from '@reduxjs/toolkit';
import { newsApi } from '../features/news/api/newsApi';
import favoritesReducer from '../features/favorites/model/favoritesSlice';
import authReducer from '../features/auth/model/authSlice';

export const store = configureStore({
  reducer: {
    [newsApi.reducerPath]: newsApi.reducer,
    favorites: favoritesReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(newsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;