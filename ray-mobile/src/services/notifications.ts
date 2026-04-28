import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { usersApi } from './api'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
})

/**
 * Register this device for push notifications and save the token to the user's profile.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[FCM] Push notifications require a physical device')
    return null
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('[FCM] Push notification permission denied')
    return null
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name:             'default',
      importance:       Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:       '#E8390E',
    })
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data
  console.log('[FCM] Push token:', token)

  // Save token to user profile
  try {
    await usersApi.updateProfile({ fcmToken: token } as never)
  } catch {
    console.warn('[FCM] Could not save push token to profile')
  }

  return token
}

/**
 * Set badge count on the app icon.
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count)
}

/**
 * Clear all delivered notifications.
 */
export async function clearNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync()
  await Notifications.setBadgeCountAsync(0)
}
