import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const initNotifications = async () => {
  if (Capacitor.getPlatform() === 'web') {
    // Web notifications
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  } else {
    try {
      // Native notifications (Android/iOS)
      const permStatus = await LocalNotifications.requestPermissions();
      if (permStatus.display === 'granted') {
        // Also register for push if on native
        try {
          await PushNotifications.requestPermissions();
          await PushNotifications.register();
        } catch (pushErr) {
          console.warn('Push registration failed, continuing with local only:', pushErr);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Local notification permission failed:', err);
      return false;
    }
  }
};

export const sendNotification = async (title: string, body: string) => {
  if (Capacitor.getPlatform() === 'web') {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  } else {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Math.floor(Math.random() * 10000),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
        }
      ]
    });
  }
};
