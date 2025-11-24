import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NewsListScreen from '../pages/NewsListScreen';
import NewsDetailScreen from '../pages/NewsDetailScreen';
import FavoritesScreen from '../pages/FavoritesScreen';
import LoginScreen from '../pages/LoginScreen';
import { useAppSelector } from '../store/hooks';
import type { Article } from '../features/news/api/newsApi';
import FileManagerScreen from '../pages/FileManagerScreen';

export type RootStackParamList = {
  Login: undefined;
  NewsList: undefined;
  NewsDetail: { article: Article };
  Favorites: undefined;
  FileManager: undefined; 
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="NewsList" component={NewsListScreen} />
            <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="FileManager" component={FileManagerScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}