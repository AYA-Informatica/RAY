// app/_layout.tsx — root layout
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAuthStore } from '@/src/store/authStore'
import { Colors } from '@/src/theme/colors'
import { registerForPushNotifications } from '@/src/services/notifications'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 1000 * 60 * 5 } },
})

export default function RootLayout() {
  const initAuth = useAuthStore((s) => s.initAuth)

  useEffect(() => {
    const unsub = initAuth()
    registerForPushNotifications()
    return unsub
  }, [initAuth])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack
            screenOptions={{
              headerShown:      false,
              contentStyle:     { backgroundColor: Colors.background },
              animation:        'slide_from_right',
            }}
          >
            <Stack.Screen name="index"         options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)"        options={{ headerShown: false }} />
            <Stack.Screen name="onboarding"    options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="login"         options={{ headerShown: false }} />
            <Stack.Screen name="otp"           options={{ headerShown: false }} />
            <Stack.Screen name="setup-profile" options={{ headerShown: false }} />
            <Stack.Screen name="listing/[id]"  options={{ headerShown: false }} />
            <Stack.Screen name="chat/[id]"     options={{ headerShown: false }} />
            <Stack.Screen name="profile/[id]"  options={{ headerShown: false }} />
            <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="post"          options={{ headerShown: false, presentation: 'modal' }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
