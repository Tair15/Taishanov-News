import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Text, View, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
    registerForPushNotificationsAsync,
    sendLocalNotification,
    scheduleNotification
} from '../../../shared/lib/notificationService';

export default function NotificationButton() {
    const [expoPushToken, setExpoPushToken] = useState<string>('');
    const notificationListener = useRef<any>();
    const responseListener = useRef<any>();

    useEffect(() => {
        // Регистрация для уведомлений
        registerForPushNotificationsAsync().then(token => {
            if (token) setExpoPushToken(token || 'ready');
        });

        // Слушатель входящих уведомлений
        const sub1 = Notifications.addNotificationReceivedListener(notification => {
            console.log('Получено уведомление:', notification);
        });

        // Слушатель нажатия на уведомление
        const sub2 = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification clicked:', response);
        });

        return () => {
            // Просто убираем, т.к. в Expo Go это не работает корректно
        };
    }, []);

    const handleSendNotification = () => {
        Alert.alert(
            'Выберите тип уведомления',
            '',
            [
                {
                    text: 'Сразу',
                    onPress: () => sendLocalNotification(
                        '📰 Новая новость!',
                        'У вас есть непрочитанные новости'
                    ),
                },
                {
                    text: 'Через 5 секунд',
                    onPress: () => scheduleNotification(
                        '⏰ Напоминание',
                        'Проверьте новости!',
                        5
                    ),
                },
                {
                    text: 'Отмена',
                    style: 'cancel',
                },
            ]
        );
    };

    return (
        <View className="px-3 mt-2">
            <TouchableOpacity
                onPress={handleSendNotification}
                className="bg-purple-500 p-3 rounded-lg"
            >
                <Text className="text-white text-center font-bold">
                    🔔 Отправить уведомление
                </Text>
            </TouchableOpacity>

            {expoPushToken && (
                <Text className="text-xs text-gray-500 mt-2 text-center">
                    Push Token получен ✅
                </Text>
            )}
        </View>
    );
}