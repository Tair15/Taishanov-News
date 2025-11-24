import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Article } from '../../news/api/newsApi';

interface FavoritesState {
  articles: Article[];
}

const initialState: FavoritesState = {
  articles: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavorites: (state, action: PayloadAction<Article[]>) => {
      state.articles = action.payload;
    },
    addFavorite: (state, action: PayloadAction<Article>) => {
      const exists = state.articles.find(a => a.url === action.payload.url);
      if (!exists) {
        state.articles.push(action.payload);
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.articles = state.articles.filter(a => a.url !== action.payload);
    },
  },
});

export const { setFavorites, addFavorite, removeFavorite } = favoritesSlice.actions;

// Thunks для работы с AsyncStorage
export const loadFavorites = () => async (dispatch: any) => {
  try {
    const stored = await AsyncStorage.getItem('favorites');
    if (stored) {
      dispatch(setFavorites(JSON.parse(stored)));
    }
  } catch (error) {
    console.error('Ошибка загрузки избранного:', error);
  }
};

export const saveFavoriteToStorage = (article: Article) => async (dispatch: any, getState: any) => {
  try {
    dispatch(addFavorite(article));
    const { favorites } = getState();
    await AsyncStorage.setItem('favorites', JSON.stringify(favorites.articles));
  } catch (error) {
    console.error('Ошибка сохранения в избранное:', error);
  }
};

export const removeFavoriteFromStorage = (url: string) => async (dispatch: any, getState: any) => {
  try {
    dispatch(removeFavorite(url));
    const { favorites } = getState();
    await AsyncStorage.setItem('favorites', JSON.stringify(favorites.articles));
  } catch (error) {
    console.error('Ошибка удаления из избранного:', error);
  }
};

export default favoritesSlice.reducer;