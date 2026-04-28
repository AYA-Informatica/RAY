import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import FlashMessage from 'react-native-flash-message'
import { AppNavigator } from '@/navigation/AppNavigator'
import { useAuthStore } from '@/store/authStore'
import { registerForPushNotifications } from '@/services/notifications'

export default function App() {
  const initAuth = useAuthStore((s) => s.initAuth)

  useEffect(() => {
    const unsubscribe = initAuth()
    registerForPushNotifications()
    return unsubscribe
  }, [initAuth])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigator />
        <FlashMessage position="top" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
