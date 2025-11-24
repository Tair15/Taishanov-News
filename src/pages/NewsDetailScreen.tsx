import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import type { Article } from '../features/news/api/newsApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { saveFavoriteToStorage, removeFavoriteFromStorage } from '../features/favorites/model/favoritesSlice';

interface NewsDetailScreenProps {
    route: {
        params: {
            article: Article;
        };
    };
    navigation: any;
}

export default function NewsDetailScreen({ route, navigation }: NewsDetailScreenProps) {
    const { article } = route.params;
    const [showWebView, setShowWebView] = React.useState(false);
    const [webViewLoading, setWebViewLoading] = React.useState(false);

    const dispatch = useAppDispatch();
    const favorites = useAppSelector(state => state.favorites.articles);
    const isFavorite = favorites.some(a => a.url === article.url);

    const isWeb = Platform.OS === 'web';

    const handleToggleFavorite = () => {
        if (isFavorite) {
            dispatch(removeFavoriteFromStorage(article.url));
        } else {
            dispatch(saveFavoriteToStorage(article));
        }
    };

    // Web view mode
    if (showWebView) {
        if (isWeb) {
            // For web — open in a new tab instead of WebView
            if (typeof window !== 'undefined') {
                window.open(article.url, '_blank');
                setShowWebView(false);
            }
        }

        return (
            <View className="flex-1 bg-white pt-12">
                {webViewLoading && (
                    <View className="flex-1 justify-center items-center absolute inset-0 z-10 bg-white">
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                )}

                <WebView
                    source={{ uri: article.url }}
                    style={{ flex: 1 }}
                    onLoadStart={() => setWebViewLoading(true)}
                    onLoadEnd={() => setWebViewLoading(false)}
                    onError={() => setWebViewLoading(false)}
                />

                {/* Back button */}
                <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-300">
                    <View
                        className="p-4 pb-8"
                        style={{ maxWidth: 800, alignSelf: 'center', width: '100%' }}
                    >
                        <TouchableOpacity
                            onPress={() => setShowWebView(false)}
                            className="border border-black py-3"
                            style={{ maxWidth: 600, alignSelf: 'center', width: '100%' }}
                        >
                            <Text className="text-center font-bold">Back to article</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    // Article view mode
    return (
        <View className="flex-1 bg-white pt-12">
            <ScrollView className="flex-1">
                <View
                    className="p-6"
                    style={isWeb ? { maxWidth: 800, width: '100%', alignSelf: 'center' } : {}}
                >
                    {/* Title */}
                    <Text className="text-4xl font-bold mb-6 leading-tight" style={{ fontFamily: 'serif' }}>
                        {article.title}
                    </Text>

                    {/* Meta information */}
                    <View className="flex-row justify-between mb-6 pb-6 border-b border-gray-300">
                        <Text className="text-sm text-gray-600">{article.author || 'Unknown author'}</Text>
                        <Text className="text-sm text-gray-600">
                            {new Date(article.publishedAt).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </Text>
                    </View>

                    {/* Image */}
                    {article.urlToImage && (
                        <Image
                            source={{ uri: article.urlToImage }}
                            className="w-full bg-gray-200 mb-6"
                            style={{ height: isWeb ? 500 : 300 }}
                            resizeMode="cover"
                        />
                    )}

                    {/* Description */}
                    <Text className="text-lg text-gray-800 mb-6 leading-7" style={{ fontFamily: 'serif' }}>
                        {article.description}
                    </Text>

                    {/* Content */}
                    {article.content && (
                        <Text className="text-base text-gray-700 leading-7" style={{ fontFamily: 'serif' }}>
                            {article.content.replace(/\[\+\d+ chars\]/g, '...')}
                        </Text>
                    )}
                </View>

                {/* Bottom padding */}
                <View className="h-32" />
            </ScrollView>

            {/* Bottom buttons */}
            <View
                className="absolute bottom-0 bg-white border-t border-gray-300"
                style={{ maxWidth: 600, alignSelf: 'center', width: '100%' }}
            >
                <View className="p-4 pb-8">
                    <View
                        className="flex-row gap-2 mb-3"
                        style={isWeb ? { maxWidth: 600, alignSelf: 'center', width: '100%' } : {}}
                    >
                        <TouchableOpacity
                            onPress={() => setShowWebView(true)}
                            className="flex-1 bg-black py-3"
                        >
                            <Text className="text-white text-center font-bold text-sm">
                                Read more
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleToggleFavorite}
                            className={`flex-1 py-3 ${isFavorite ? 'bg-gray-800' : 'border border-black'}`}
                        >
                            <Text className={`text-center font-bold text-sm ${isFavorite ? 'text-white' : 'text-black'}`}>
                                {isFavorite ? 'Saved ★' : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="border border-black py-3"
                        style={isWeb ? { maxWidth: 600, alignSelf: 'center', width: '100%' } : {}}
                    >
                        <Text className="text-center font-bold text-sm">← Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
