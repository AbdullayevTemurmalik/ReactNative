import { Platform } from 'react-native';

let Notifications = null;
let Device = null;

try {
  Notifications = require('expo-notifications');
} catch (err) {
  // Native notification module fallback
}

try {
  Device = require('expo-device');
} catch (err) {
  // Device module fallback
}

/**
 * 1. Bildirishnoma Handler sozlamasi:
 * Ilova ochiq (foreground) yoki orqa fonda (background) bo'lganda ham
 * ovoz bilan tepadan banner bo'lib tushishini ta'minlaydi.
 */
try {
  if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch (e) {
  // ignore
}

/**
 * 2. Bildirishnoma ruxsatini olish va Android kanalini sozlash
 */
export async function registerForPushNotificationsAsync() {
  let token = null;

  try {
    // Android qurilmalar uchun yuqori darajadagi (MAX) ovozli kanal
    if (Platform.OS === 'android' && Notifications?.setNotificationChannelAsync) {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'SmartBozor Bildirishnomalari',
        importance: Notifications.AndroidImportance?.MAX || 5,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
        sound: true,
        enableVibrate: true,
        showBadge: true,
      });

      // Buyurtmalar kanali
      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Buyurtmalar holati',
        importance: Notifications.AndroidImportance?.MAX || 5,
        vibrationPattern: [0, 300, 200, 300],
        lightColor: '#10B981',
        sound: true,
        enableVibrate: true,
        showBadge: true,
      });
    }

    if (Notifications?.getPermissionsAsync && (Device?.isDevice || Platform.OS === 'android' || Platform.OS === 'ios')) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Bildirishnomalar uchun ruxsat berilmadi.');
        return null;
      }
    }
  } catch (error) {
    console.warn('registerForPushNotificationsAsync xatolik:', error?.message);
  }

  return token;
}

/**
 * 3. Qayta ishlatiladigan (reusable) bildirishnoma funksiyasi:
 * triggerCustomNotification(title, body, delaySeconds, data)
 *
 * @param {string} title - Bildirishnoma sarlavhasi
 * @param {string} body - Bildirishnoma matni
 * @param {number} [delaySeconds=0] - Necha soniyadan keyin chiqishi (0 = darhol)
 * @param {object} [data={}] - Qo'shimcha ma'lumotlar
 */
export async function triggerCustomNotification(title, body, delaySeconds = 0, data = {}) {
  try {
    if (!Notifications?.scheduleNotificationAsync) {
      return null;
    }

    const targetChannelId = data?.channelId || 'default';
    let trigger = null;

    if (delaySeconds && delaySeconds > 0) {
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes?.TIME_INTERVAL || 'timeInterval',
        seconds: Math.max(1, Math.round(delaySeconds)),
        repeats: false,
        channelId: targetChannelId,
      };
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority?.MAX || 'max',
        vibrate: [0, 250, 250, 250],
        data: data || {},
        channelId: targetChannelId,
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.warn('triggerCustomNotification xatolik:', error?.message);
    return null;
  }
}

/**
 * 4. Foydalanuvchi ilovaga kirishi bilan xush kelibsiz bildirishnomasi
 */
export async function sendWelcomeNotification(language = 'uz') {
  try {
    const isRu = language === 'ru';
    const title = isRu
      ? 'SmartBozor га добро пожаловать! 🎉'
      : 'SmartBozor ga xush kelibsiz! 🎉';
    const body = isRu
      ? 'Лучшие скидки и горячие новинки ждут вас! Приятных покупок 🛍️'
      : "Eng yaxshi chegirmalar va yangi mahsulotlar sizni kutmoqda! Xaridingiz maroqli bo'lsin 🛍️";

    await triggerCustomNotification(title, body, 1, {
      type: 'welcome',
      channelId: 'default',
    });
  } catch (error) {
    console.warn('sendWelcomeNotification xatolik:', error?.message);
  }
}

/**
 * 5. Barcha rejalashtirilgan bildirishnomalarni bekor qilish
 */
export async function cancelAllScheduledNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('cancelAllScheduledNotifications xatolik:', error?.message);
  }
}
