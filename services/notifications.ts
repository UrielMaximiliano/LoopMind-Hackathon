import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  hour: 20,
  minute: 0,
};

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupNotifications(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permission not granted for notifications');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error setting up notifications:', error);
    return false;
  }
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (settings) {
      return JSON.parse(settings);
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return defaultSettings;
  }
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    
    if (settings.enabled) {
      await scheduleDailyReminder(settings.hour, settings.minute);
    } else {
      await cancelReminders();
    }
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

export async function scheduleDailyReminder(hour: number = 20, minute: number = 0): Promise<void> {
  try {
    // Cancel any existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Schedule new daily reminder
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "¿Cómo te sientes hoy? 😊",
        body: "Tómate un momento para registrar tu estado emocional",
        data: { screen: 'emotion-check' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    
    console.log(`Daily reminder scheduled for ${hour}:${minute}`);
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
  }
}

export async function cancelReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All reminders cancelled');
  } catch (error) {
    console.error('Error cancelling reminders:', error);
  }
}

export async function handleNotificationResponse(response: Notifications.NotificationResponse): Promise<void> {
  const { screen } = response.notification.request.content.data;
  
  if (screen === 'emotion-check') {
    // Navigate to emotion input screen
    // This will be handled in the main app component
    console.log('Navigate to emotion check screen');
  }
}

// Function to initialize notification listeners
export function initializeNotificationListeners(): void {
  // Listen for notification responses
  Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
  
  // Listen for notifications received while app is foregrounded
  Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
  });
} 