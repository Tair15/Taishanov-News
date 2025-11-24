import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Image, ActivityIndicator, TouchableOpacity, TextInput, Platform, Dimensions } from 'react-native';
import { useGetTopHeadlinesQuery, useSearchNewsQuery } from '../features/news/api/newsApi';
import type { Article } from '../features/news/api/newsApi';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAppDispatch } from '../store/hooks';
import { logoutUser } from '../features/auth/model/authSlice';
import { Alert } from 'react-native';
import { sendLocalNotification, scheduleNotification } from '../shared/lib/notificationService';

interface NewsListScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'NewsList'>;
}

export default function NewsListScreen({ navigation }: NewsListScreenProps) {
  const [page, setPage] = useState(1);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const dispatch = useAppDispatch();
  const isWeb = Platform.OS === 'web';
  const screenWidth = Dimensions.get('window').width;
  const numColumns = isWeb && screenWidth > 768 ? (screenWidth > 1200 ? 3 : 2) : 1;

  const { data: headlinesData, isLoading: headlinesLoading, error: headlinesError, isFetching: headlinesFetching } = 
    useGetTopHeadlinesQuery({ country: 'us', page }, { skip: isSearching });
  
  const { data: searchData, isLoading: searchLoading, error: searchError, isFetching: searchFetching } = 
    useSearchNewsQuery({ query: searchQuery, page }, { skip: !isSearching || !searchQuery });

  const data = isSearching ? searchData : headlinesData;
  const isLoading = isSearching ? searchLoading : headlinesLoading;
  const isFetching = isSearching ? searchFetching : headlinesFetching;
  const error = isSearching ? searchError : headlinesError;

  useEffect(() => {
    if (data?.articles) {
      if (page === 1) {
        setAllArticles(data.articles);
      } else {
        setAllArticles(prev => {
          const newArticles = data.articles.filter(
            newArticle => !prev.some(existingArticle => existingArticle.url === newArticle.url)
          );
          return [...prev, ...newArticles];
        });
      }
    }
    setIsLoadingMore(false);
  }, [data]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      setPage(1);
      setAllArticles([]);
    } else {
      setIsSearching(false);
      setPage(1);
      setAllArticles([]);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setPage(1);
    setAllArticles([]);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

  const handleLoadMore = () => {
    if (!isFetching && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    }
  };

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
        <Text className="text-xs text-gray-500">
          {item.source.name}
        </Text>
        <Text className="text-xs text-gray-500">
          {new Date(item.publishedAt).toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'short',
            year: 'numeric' 
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && page === 1 && allArticles.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error && allArticles.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-base text-red-500">Loadin egrror</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header с ограничением ширины для веба */}
      <View 
        className="pt-12 pb-4 px-4 border-b border-gray-300 bg-white"
        style={isWeb ? { maxWidth: 1200, width: '100%', alignSelf: 'center' } : {}}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-3xl font-bold" style={{ fontFamily: 'serif' }}>
            NewsApp
          </Text>
          <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
            <Text className="text-2xl">☰</Text>
          </TouchableOpacity>
        </View>

        {/* Поиск с ограничением ширины */}
        <View 
          className="flex-row items-center border border-gray-300 rounded px-3 py-2"
          style={isWeb ? { maxWidth: 600 } : {}}
        >
          <TextInput
            className="flex-1 text-sm"
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {isSearching ? (
            <TouchableOpacity onPress={handleClearSearch}>
              <Text className="text-gray-600 ml-2">✕</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleSearch}>
              <Text className="text-gray-600 ml-2">🔍</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Выдвижное меню */}
      {showMenu && (
        <View 
          className="absolute top-32 right-4 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-48"
          style={isWeb ? { right: Math.max(16, (screenWidth - 1200) / 2) } : {}}
        >
          <TouchableOpacity 
            onPress={() => {
              navigation.navigate('Favorites');
              setShowMenu(false);
            }}
            className="p-4 border-b border-gray-200"
          >
            <Text className="text-sm">⭐ Favorites</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
              navigation.navigate('FileManager');
              setShowMenu(false);
            }}
            className="p-4 border-b border-gray-200"
          >
            <Text className="text-sm">📁 Files</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
              Alert.alert(
                'Send notification',
                'Chose the type of notification',
                [
                  {
                    text: 'Now',
                    onPress: () => {
                      sendLocalNotification('📰 New news!', 'You have unread news');
                      setShowMenu(false);
                    },
                  },
                  {
                    text: 'In 5 seconds',
                    onPress: () => {
                      scheduleNotification('⏰ Reminder', 'Check the news!', 5);
                      setShowMenu(false);
                    },
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => setShowMenu(false),
                  },
                ]
              );
            }}
            className="p-4 border-b border-gray-200"
          >
            <Text className="text-sm">🔔 Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
              handleLogout();
              setShowMenu(false);
            }}
            className="p-4"
          >
            <Text className="text-sm text-red-600">🚪 Exit</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Список новостей с контейнером */}
      <View 
        className="flex-1"
        style={isWeb ? { maxWidth: 1200, width: '100%', alignSelf: 'center' } : {}}
      >
        <FlatList
          data={allArticles}
          key={numColumns} // Важно для перерисовки при изменении колонок
          numColumns={numColumns}
          keyExtractor={(item, index) => `${item.url}-${index}`}
          renderItem={renderArticle}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
          ListFooterComponent={
            (isFetching || isLoadingMore) && page > 1 ? (
              <ActivityIndicator size="large" color="#000" style={{ marginVertical: 20 }} />
            ) : null
          }
        />
      </View>
    </View>
  );
}