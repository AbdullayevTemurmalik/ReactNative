/**
 * Notification Service (Proxy & Re-export to notificationHelper)
 */
export {
  registerForPushNotificationsAsync,
  triggerCustomNotification,
  sendWelcomeNotification,
  scheduleSmartReminders,
  cancelAllScheduledNotifications,
  subscribeNotificationEvents,
} from './notificationHelper';
