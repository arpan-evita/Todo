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
    // Native notifications (Android/iOS)
    const permStatus = await LocalNotifications.requestPermissions();
    if (permStatus.display === 'granted') {
      // Also register for push if on native
      await PushNotifications.requestPermissions();
      await PushNotifications.register();
      return true;
    }
    return false;
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
