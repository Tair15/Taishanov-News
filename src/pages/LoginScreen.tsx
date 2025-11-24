import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  checkBiometricSupport, 
  authenticateWithBiometric, 
  loadAuthState,
  setAuthenticated 
} from '../features/auth/model/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { isBiometricSupported, isBiometricEnrolled } = useAppSelector(state => state.auth);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const init = async () => {
      await dispatch(loadAuthState());
      await dispatch(checkBiometricSupport());
      setLoading(false);
    };
    init();
  }, []);

  const handleBiometricLogin = async () => {
    await dispatch(authenticateWithBiometric());
  };

  const handleManualLogin = async () => {
    // Вход без биометрии (для веба и тестирования)
    dispatch(setAuthenticated(true));
    await AsyncStorage.setItem('isAuthenticated', 'true');
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-4xl mb-2" style={{ fontFamily: 'serif' }}>📰</Text>
      <Text className="text-3xl font-bold mb-2" style={{ fontFamily: 'serif' }}>Taishanov News</Text>
      <Text className="text-sm text-gray-600 mb-8 text-center">
        Welcome
      </Text>

      {isBiometricSupported && isBiometricEnrolled ? (
        <>
          <TouchableOpacity 
            onPress={handleBiometricLogin}
            className="bg-black p-4 w-full mb-3"
          >
            <Text className="text-white text-center font-bold">
              Log In with Biometrics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleManualLogin}
            className="border border-black p-4 w-full"
          >
            <Text className="text-center font-bold">
              Log In Manually
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity 
          onPress={handleManualLogin}
          className="bg-black p-4 w-full"
        >
          <Text className="text-white text-center font-bold">
            Log In
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}