import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

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
 * 2. Android 8-15+ tizimlari uchun yuqori darajadagi ovozli kanallarni sozlash
 * va bildirishnoma ruxsatini olish (Play Protect standartlariga mos)
 */
export async function registerForPushNotificationsAsync() {
  try {
    if (!Notifications) return false;

    // Android tizimlari uchun ovozli va yuqori darajadagi (MAX) kanallar
    if (Platform.OS === 'android' && Notifications.setNotificationChannelAsync) {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'SmartBozor Bildirishnomalari',
        importance: Notifications.AndroidImportance?.MAX || 5,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        enableLights: true,
      });

      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Buyurtmalar holati',
        importance: Notifications.AndroidImportance?.MAX || 5,
        vibrationPattern: [0, 300, 200, 300],
        lightColor: '#10B981',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        enableLights: true,
      });

      await Notifications.setNotificationChannelAsync('promos', {
        name: 'Chegirma va Aksiyalar',
        importance: Notifications.AndroidImportance?.HIGH || 4,
        vibrationPattern: [0, 200, 200, 200],
        lightColor: '#F59E0B',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        enableLights: true,
      });
    }

    // Foydalanuvchidan bildirishnoma ruxsatini so'rash (Android 13+ va iOS)
    if (Notifications.getPermissionsAsync) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted' && Notifications.requestPermissionsAsync) {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
          android: {},
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }
      return true;
    }
  } catch (error) {
    return false;
  }
  return true;
}

/**
 * 3. Qayta ishlatiladigan (reusable) mahalliy bildirishnoma chiqarish funksiyasi
 */
export async function triggerCustomNotification(title, body, delaySeconds = 0, data = {}) {
  try {
    if (!Notifications || !Notifications.scheduleNotificationAsync) {
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
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority?.MAX || 'max',
        vibrate: [0, 250, 250, 250],
        data: {
          ...data,
          channelId: targetChannelId,
        },
        channelId: targetChannelId,
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    return null;
  }
}

/**
 * 4. Foydalanuvchi ilovaga kirishi bilan test / xush kelibsiz bildirishnomasi
 */
export async function sendWelcomeNotification(language = 'uz') {
  try {
    const isRu = language === 'ru';
    const title = isRu
      ? 'SmartBozor ga xush kelibsiz! 🎉'
      : 'SmartBozor ga xush kelibsiz! 🎉';
    const body = isRu
      ? 'Горячие скидки и новинки ждут вас! Приятных покупок 🛍️'
      : "Eng yaxshi chegirmalar va yangi mahsulotlar sizni kutmoqda! Xaridingiz maroqli bo'lsin 🛍️";

    await triggerCustomNotification(title, body, 1, {
      type: 'welcome',
      channelId: 'default',
    });
  } catch (error) {
    // ignore
  }
}

/**
 * 5. AVTOMATIK MAHALLIY ESLATMALAR (Scheduled Notifications):
 * Foydalanuvchi ilovani yopib qo'ygan taqdirda ham unga Telegram kabi
 * kunlik / haftalik qiziqarli eslatmalar kelib turadi.
 */
export async function scheduleSmartReminders(language = 'uz') {
  try {
    if (!Notifications || !Notifications.scheduleNotificationAsync || !Notifications.cancelAllScheduledNotificationsAsync) {
      return;
    }

    // Avvalgi rejalashtirilgan eslatmalarni tozalash
    await Notifications.cancelAllScheduledNotificationsAsync();

    const isRu = language === 'ru';

    // 1-eslatma: 4 soatdan keyin
    await triggerCustomNotification(
      isRu ? '🔥 Горячие скидки в SmartBozor!' : '🔥 Smart Bozorda yangi chegirmalar!',
      isRu
        ? 'Не упустите лучшие цены и выгодные предложения на сегодня! 🛍️'
        : "Bugungi eng yaxshi narxlarni ko'rib chiqing va foydali chegirmalarga ega bo'ling! 🛍️",
      4 * 3600,
      { type: 'reminder_4h', channelId: 'promos' }
    );

    // 2-eslatma: 24 soatdan keyin (Ertaga)
    await triggerCustomNotification(
      isRu ? '⚡️ Товары дня обновлены!' : '⚡️ Kun mahsulotlari yangilandi!',
      isRu
        ? 'Новинки в ваших любимых категориях и супер цены ждут вас! 🎁'
        : "Siz qiziqqan toifadagi yangi mahsulotlar va maxsus narxlar sizni kutmoqda! 🎁",
      24 * 3600,
      { type: 'reminder_24h', channelId: 'promos' }
    );

    // 3-eslatma: 3 kundan keyin
    await triggerCustomNotification(
      isRu ? '🛍️ Ваша корзина ждет вас!' : '🛍️ Savatchangiz sizni kutyapti!',
      isRu
        ? 'Не забудьте оформить заказ на выбранные товары с быстрой доставкой! ✨'
        : "Sevimli mahsulotlaringizni xarid qilishni unutmang, qulay yetkazib berish mavjud! ✨",
      3 * 24 * 3600,
      { type: 'reminder_3d', channelId: 'default' }
    );

    // 4-eslatma: 6 kundan keyin (Hafta oxiri)
    await triggerCustomNotification(
      isRu ? '🎉 Акции выходного дня!' : '🎉 Dam olish kuni aksiyalari!',
      isRu
        ? 'В SmartBozor начались грандиозные скидки выходных! Заходите в приложение! 🚀'
        : "Smart Bozorda hafta yakunidagi super chegirmalar boshlandi! Ilovaga kiring va tanlang! 🚀",
      6 * 24 * 3600,
      { type: 'reminder_6d', channelId: 'promos' }
    );
  } catch (error) {
    // ignore
  }
}

/**
 * 6. Barcha rejalashtirilgan bildirishnomalarni bekor qilish
 */
export async function cancelAllScheduledNotifications() {
  try {
    if (Notifications && Notifications.cancelAllScheduledNotificationsAsync) {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  } catch (error) {
    // ignore
  }
}

/**
 * 7. Bildirishnoma qabul qiluvchi listener obunasi (Memory leak oldini olish bilan)
 */
export function subscribeNotificationEvents(onReceive, onResponse) {
  const subscriptions = [];
  try {
    if (Notifications?.addNotificationReceivedListener && onReceive) {
      const sub = Notifications.addNotificationReceivedListener(onReceive);
      subscriptions.push(sub);
    }
    if (Notifications?.addNotificationResponseReceivedListener && onResponse) {
      const sub = Notifications.addNotificationResponseReceivedListener(onResponse);
      subscriptions.push(sub);
    }
  } catch (e) {
    // ignore
  }

  // Unmount vaqtida tozalash funksiyasi
  return () => {
    subscriptions.forEach((sub) => {
      try {
        if (sub && typeof sub.remove === 'function') {
          sub.remove();
        } else if (Notifications?.removeNotificationSubscription) {
          Notifications.removeNotificationSubscription(sub);
        }
      } catch (e) {
        // ignore
      }
    });
  };
}
