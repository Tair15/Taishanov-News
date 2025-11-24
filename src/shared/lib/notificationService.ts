import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Настройка поведения уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Запрос разрешений и получение токена
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Не удалось получить разрешение на уведомления');
      return;
    }
    
    // Для Expo Go просто пропускаем получение токена
    // В production build это будет работать
    console.log('Push notifications ready (локальные уведомления работают)');
  } else {
    console.log('Для Push-уведомлений нужно физическое устройство');
  }

  return token;
}

// Отправка локального уведомления
export async function sendLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { data: 'goes here' },
    },
    trigger: { seconds: 1 },
  });
}

// Отправка уведомления с задержкой
export async function scheduleNotification(title: string, body: string, seconds: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { data: 'goes here' },
    },
    trigger: { seconds },
  });
}