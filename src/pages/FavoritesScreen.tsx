import React from 'react';
import { View, FlatList, Text, Image, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadFavorites } from '../features/favorites/model/favoritesSlice';
import type { Article } from '../features/news/api/newsApi';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

interface FavoritesScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Favorites'>;
}

export default function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(state => state.favorites.articles);

  const isWeb = Platform.OS === 'web';
  const screenWidth = Dimensions.get('window').width;
  const numColumns = isWeb && screenWidth > 768 ? (screenWidth > 1200 ? 3 : 2) : 1;

  React.useEffect(() => {
    dispatch(loadFavorites());
  }, []);

  const renderArticle = ({ item }: { item: Article }) => (
    <TouchableOpacity 
      className={`mb-6 border-b border-gray-200 pb-6 ${isWeb && numColumns > 1 ? 'mx-2' : ''}`}
      style={isWeb && numColumns > 1 ? { width: `${100 / numColumns - 2}%` } : {}}
      onPress={() => navigation.navigate('NewsDetail', { article: item })}
    >
      <Text className="text-xl font-bold mb-3 text-black leading-6">
        {item.title}
      </Text>
      
      <Text className="text-sm text-gray-700 mb-3 leading-5" numberOfLines={3}>
        {item.description}
      </Text>

      {item.urlToImage && (
        <Image 
          source={{ uri: item.urlToImage }} 
          className="w-full h-48 bg-gray-200 mb-2"
          resizeMode="cover"
        />
      )}

      <View className="flex-row justify-between items-center">
        <Text className="text-xs text-gray-500">{item.source.name}</Text>
        <Text className="text-xs text-gray-500">
          {new Date(item.publishedAt).toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'short' 
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (favorites.length === 0) {
    return (
      <View className="flex-1 bg-white">
        <View 
          className="pt-12 pb-4 px-4 border-b border-gray-300"
          style={isWeb ? { maxWidth: 1200, width: '100%', alignSelf: 'center' } : {}}
        >
          <View className="flex-row justify-between items-center">
            <Text className="text-3xl font-bold" style={{ fontFamily: 'serif' }}>
              Favorites
            </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-base">← Back</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-lg text-gray-500 text-center mb-4">
            There are no featured articles yet.
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('NewsList')}
            className="bg-black px-6 py-3 rounded"
          >
            <Text className="text-white font-bold">To the news</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white pt-12">
      <View 
        className="pt-12 pb-4 px-4 border-b border-gray-300"
        style={isWeb ? { maxWidth: 1200, width: '100%', alignSelf: 'center' } : {}}
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-3xl font-bold" style={{ fontFamily: 'serif' }}>
            Favorites ({favorites.length})
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-base">← back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View 
        className="flex-1"
        style={isWeb ? { maxWidth: 1200, width: '100%', alignSelf: 'center' } : {}}
      >
        <FlatList
          data={favorites}
          key={numColumns}
          numColumns={numColumns}
          keyExtractor={(item, index) => `${item.url}-${index}`}
          renderItem={renderArticle}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
        />
      </View>
    </View>
  );
}