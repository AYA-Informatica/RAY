import { useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, withSpring, Easing,
} from 'react-native-reanimated'
import { Colors, Typography } from '@/theme/colors'
import { useAuthStore } from '@/store/authStore'

const { width, height } = Dimensions.get('window')

// ─────────────────────────────────────────────
// SplashScreen
// ─────────────────────────────────────────────
export const SplashScreen = () => {
  const router    = useRouter()
  const { user, isInitialized } = useAuthStore()
  const scale     = useSharedValue(0.7)
  const opacity   = useSharedValue(0)

  useEffect(() => {
    scale.value   = withSpring(1, { damping: 12, stiffness: 100 })
    opacity.value = withTiming(1, { duration: 400 })

    const timer = setTimeout(() => {
      if (isInitialized) {
        router.replace(user ? '/(tabs)' : '/onboarding')
      }
    }, 2200)
    return () => clearTimeout(timer)
  }, [isInitialized, user, router, scale, opacity])

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity:   opacity.value,
  }))

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <Text style={styles.logo}>RAY</Text>
        <Text style={styles.tagline}>Buy &amp; Sell Anything Near You</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  logoWrap: { alignItems: 'center', gap: 10 },
  logo: {
    fontSize:   72,
    fontWeight: '800',
    color:      Colors.white,
    fontFamily: Typography.fontDisplay,
    letterSpacing: -2,
  },
  tagline: {
    fontSize:   16,
    color:      'rgba(255,255,255,0.85)',
    fontFamily: Typography.fontSans,
    letterSpacing: 0.3,
  },
})
