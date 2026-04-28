import { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { ShieldCheck } from 'lucide-react-native'
import { Button, Input } from '@/components/atoms'
import { useAuthStore } from '@/store/authStore'
import { Colors, Typography, Radii, Spacing } from '@/theme/colors'

// ─────────────────────────────────────────────
// PhoneAuthScreen
// ─────────────────────────────────────────────
export const PhoneAuthScreen = () => {
  const router     = useRouter()
  const { sendOtp, isLoading, error, clearError } = useAuthStore()
  const [phone, setPhone] = useState('+250 ')

  useEffect(() => () => { clearError() }, [clearError])

  const handleSend = async () => {
    const clean = phone.replace(/\s/g, '').replace(/[^+\d]/g, '')
    if (clean.length < 10) return
    try {
      await sendOtp(clean)
      router.push('/otp')
    } catch { /* error shown via store */ }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>RAY</Text>

        <View style={styles.card}>
          <Text style={styles.title}>Enter Your Phone Number</Text>
          <Text style={styles.subtitle}>We Will Send You a Verification Code</Text>

          <Input
            value={phone}
            onChangeText={setPhone}
            placeholder="+250 7xx xxx xxxx"
            keyboardType="phone-pad"
            autoFocus
            error={error ?? undefined}
          />

          <Button label="SEND CODE" onPress={handleSend} loading={isLoading} fullWidth size="lg" />

          <View style={styles.trustRow}>
            <ShieldCheck size={14} color={Colors.success} />
            <Text style={styles.trustText}>
              Your number is only used for verification. We never share it.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// ─────────────────────────────────────────────
// OTPVerificationScreen
// ─────────────────────────────────────────────
export const OTPScreen = () => {
  const router     = useRouter()
  const { verifyOtp, isLoading, error, clearError } = useAuthStore()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(60)
  const inputRefs  = useRef<(TextInput | null)[]>([])
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0 }
        return c - 1
      })
    }, 1000)
    return () => { clearInterval(timerRef.current!); clearError() }
  }, [clearError])

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
    if (next.every((d) => d) && index === 5) handleVerify(next.join(''))
  }

  const handleBackspace = (index: number) => {
    if (!otp[index] && index > 0) {
      const next = [...otp]
      next[index - 1] = ''
      setOtp(next)
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (code?: string) => {
    const full = code ?? otp.join('')
    if (full.length < 6) return
    try {
      const result = await verifyOtp(full)
      router.replace(result === 'new_user' ? '/setup-profile' : '/(tabs)')
    } catch {
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>RAY</Text>

        <View style={styles.card}>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>We sent a 6-digit code to your phone</Text>

          {/* OTP boxes */}
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(el) => { inputRefs.current[i] = el }}
                value={digit}
                onChangeText={(v) => handleChange(i, v)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace') handleBackspace(i)
                }}
                keyboardType="numeric"
                maxLength={1}
                style={{
                  width: 46, height: 56,
                  backgroundColor: Colors.surfaceModal,
                  borderRadius: Radii.lg,
                  borderWidth: 2,
                  borderColor: digit ? Colors.primary : Colors.border,
                  color: Colors.textPrimary,
                  fontSize: Typography.xl,
                  fontWeight: '700',
                  textAlign: 'center',
                  fontFamily: Typography.fontDisplay,
                }}
              />
            ))}
          </View>

          {error && (
            <Text style={{ color: Colors.danger, fontSize: Typography.sm, textAlign: 'center', fontFamily: Typography.fontSans }}>
              {error}
            </Text>
          )}

          <Button
            label="Verify"
            onPress={() => handleVerify()}
            loading={isLoading}
            disabled={otp.some((d) => !d)}
            fullWidth
            size="lg"
          />

          <TouchableOpacity
            disabled={countdown > 0 || isLoading}
            onPress={() => router.back()}
            style={{ alignItems: 'center' }}
          >
            <Text style={{
              color: countdown > 0 ? Colors.textMuted : Colors.primary,
              fontSize: Typography.sm,
              fontFamily: Typography.fontSansBold,
              fontWeight: '600',
            }}>
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[5],
    gap: Spacing[6],
  },
  brand: {
    fontSize:   48,
    fontWeight: '800',
    color:      Colors.primary,
    fontFamily: Typography.fontDisplay,
    letterSpacing: -1,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii['2xl'],
    padding: Spacing[6],
    gap: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize:   Typography.xl,
    fontWeight: '700',
    color:      Colors.textPrimary,
    fontFamily: Typography.fontDisplay,
    textAlign:  'center',
  },
  subtitle: {
    fontSize:   Typography.sm,
    color:      Colors.textSecondary,
    fontFamily: Typography.fontSans,
    textAlign:  'center',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap: 8,
  },
  trustText: {
    flex:       1,
    color:      Colors.textMuted,
    fontSize:   Typography.xs,
    fontFamily: Typography.fontSans,
    lineHeight: 16,
  },
})
