import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

interface AuthState {
  isAuthenticated: boolean;
  isBiometricSupported: boolean;
  isBiometricEnrolled: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isBiometricSupported: false,
  isBiometricEnrolled: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setBiometricSupport: (state, action: PayloadAction<{ supported: boolean; enrolled: boolean }>) => {
      state.isBiometricSupported = action.payload.supported;
      state.isBiometricEnrolled = action.payload.enrolled;
    },
    logout: (state) => {
      state.isAuthenticated = false;
    },
  },
});

export const { setAuthenticated, setBiometricSupport, logout } = authSlice.actions;

// Thunk для проверки биометрии
export const checkBiometricSupport = () => async (dispatch: any) => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    dispatch(setBiometricSupport({ supported: compatible, enrolled }));
  } catch (error) {
    console.error('Ошибка проверки биометрии:', error);
  }
};

// Thunk для аутентификации
export const authenticateWithBiometric = () => async (dispatch: any) => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Войдите с помощью биометрии',
      fallbackLabel: 'Использовать пароль',
      cancelLabel: 'Отмена',
    });

    if (result.success) {
      dispatch(setAuthenticated(true));
      await AsyncStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    return false;
  }
};

// Thunk для загрузки состояния авторизации
export const loadAuthState = () => async (dispatch: any) => {
  try {
    const auth = await AsyncStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      dispatch(setAuthenticated(true));
    }
  } catch (error) {
    console.error('Ошибка загрузки состояния:', error);
  }
};

// Thunk для logout
export const logoutUser = () => async (dispatch: any) => {
  try {
    await AsyncStorage.removeItem('isAuthenticated');
    dispatch(logout());
  } catch (error) {
    console.error('Ошибка выхода:', error);
  }
};

export default authSlice.reducer;