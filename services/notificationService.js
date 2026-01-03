import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { supabase } from '../config/supabase';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    // Check for expiring subscriptions
    const { data: expiringSubs } = await supabase
      .from('subscriptions')
      .select('*, users(full_name)')
      .eq('status', 'active')
      .lte('end_date', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString())
      .gte('end_date', new Date().toISOString());

    // Send notifications
    for (const sub of expiringSubs) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Subscription Expiring Soon',
          body: `Your subscription expires in 3 days. Renew now to continue!`,
          data: { subscriptionId: sub.id },
        },
        trigger: null, // Send immediately
      });
    }

    return expiringSubs.length;
  } catch (error) {
    console.error('Background notification error:', error);
    return null;
  }
});

export const setupBackgroundNotifications = async () => {
  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status === 'granted') {
    // Register background task
    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    
    // Schedule daily check
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Check',
        body: 'Checking for expiring subscriptions...',
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  }
};