import {
  TouchableOpacity, Text, View, TextInput, ActivityIndicator,
  StyleSheet, type ViewStyle, type TextStyle,
} from 'react-native'
import { Colors, Radii, Typography, Spacing } from '@/theme/colors'

// ─── Button ───────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type BtnSize    = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: BtnVariant
  size?: BtnSize
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  style?: ViewStyle
}

const btnBg: Record<BtnVariant, string> = {
  primary:   Colors.primary,
  secondary: Colors.surfaceModal,
  outline:   Colors.transparent,
  ghost:     Colors.transparent,
  danger:    Colors.danger,
}
const btnBorder: Record<BtnVariant, string | undefined> = {
  primary:   undefined,
  secondary: Colors.border,
  outline:   Colors.border,
  ghost:     undefined,
  danger:    undefined,
}
const btnTextColor: Record<BtnVariant, string> = {
  primary:   Colors.white,
  secondary: Colors.textPrimary,
  outline:   Colors.textPrimary,
  ghost:     Colors.textSecondary,
  danger:    Colors.white,
}
const btnPy: Record<BtnSize, number> = { sm: 8, md: 12, lg: 14, xl: 16 }
const btnPx: Record<BtnSize, number> = { sm: 14, md: 18, lg: 22, xl: 28 }
const btnFs: Record<BtnSize, number> = { sm: 13, md: 14, lg: 15, xl: 16 }

export const Button = ({
  label, onPress, variant = 'primary', size = 'md',
  loading, disabled, fullWidth, leftIcon, style,
}: ButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.8}
    style={[
      {
        backgroundColor:  btnBg[variant],
        borderRadius:     Radii['2xl'],
        paddingVertical:  btnPy[size],
        paddingHorizontal:btnPx[size],
        flexDirection:    'row',
        alignItems:       'center',
        justifyContent:   'center',
        gap:              8,
        borderWidth:      btnBorder[variant] ? 1 : 0,
        borderColor:      btnBorder[variant],
        opacity:          disabled || loading ? 0.5 : 1,
      },
      fullWidth && { width: '100%' },
      style,
    ]}
  >
    {loading
      ? <ActivityIndicator size="small" color={btnTextColor[variant]} />
      : leftIcon
    }
    <Text style={{
      color:      btnTextColor[variant],
      fontSize:   btnFs[size],
      fontWeight: '600',
      fontFamily: Typography.fontSansBold,
    }}>
      {label}
    </Text>
  </TouchableOpacity>
)

// ─── Input ────────────────────────────────────
interface InputProps {
  label?: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  error?: string
  hint?: string
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'phone-pad' | 'numeric' | 'email-address'
  autoFocus?: boolean
  multiline?: boolean
  maxLength?: number
  leftIcon?: React.ReactNode
  style?: ViewStyle
}

export const Input = ({
  label, value, onChangeText, placeholder, error, hint,
  secureTextEntry, keyboardType, autoFocus, multiline, maxLength,
  leftIcon, style,
}: InputProps) => (
  <View style={{ gap: 6 }}>
    {label && (
      <Text style={{ color: Colors.textPrimary, fontSize: Typography.sm, fontWeight: '600', fontFamily: Typography.fontSansBold }}>
        {label}
      </Text>
    )}
    <View style={{ position: 'relative' }}>
      {leftIcon && (
        <View style={{ position: 'absolute', left: 12, top: '50%', transform: [{ translateY: -10 }], zIndex: 1 }}>
          {leftIcon}
        </View>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoFocus={autoFocus}
        multiline={multiline}
        maxLength={maxLength}
        style={[
          {
            backgroundColor:  Colors.surfaceModal,
            borderRadius:     Radii.lg,
            paddingVertical:  12,
            paddingHorizontal:leftIcon ? 40 : 14,
            fontSize:         Typography.sm,
            color:            Colors.textPrimary,
            fontFamily:       Typography.fontSans,
            borderWidth:      1,
            borderColor:      error ? Colors.danger : Colors.border,
          },
          multiline && { minHeight: 100, textAlignVertical: 'top' },
          style,
        ]}
      />
    </View>
    {hint  && !error && <Text style={{ color: Colors.textSecondary, fontSize: Typography.xs }}>{hint}</Text>}
    {error && <Text style={{ color: Colors.danger, fontSize: Typography.xs }}>{error}</Text>}
  </View>
)

// ─── Badge ────────────────────────────────────
type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'muted'
const badgeBg:   Record<BadgeVariant, string> = {
  primary: `${Colors.primary}30`, success: `${Colors.success}30`,
  warning: `${Colors.warning}30`, danger:  `${Colors.danger}30`, muted: '#ffffff15',
}
const badgeText: Record<BadgeVariant, string> = {
  primary: Colors.primary, success: Colors.success,
  warning: Colors.warning, danger:  Colors.danger,  muted: Colors.textSecondary,
}

export const Badge = ({ label, variant = 'muted' }: { label: string; variant?: BadgeVariant }) => (
  <View style={{ backgroundColor: badgeBg[variant], paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radii.full }}>
    <Text style={{ color: badgeText[variant], fontSize: Typography.xs, fontWeight: '600', fontFamily: Typography.fontSansBold }}>
      {label}
    </Text>
  </View>
)

// ─── Avatar ───────────────────────────────────
import { Image } from 'react-native'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
const avatarDim: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 }

export const Avatar = ({ uri, name = 'U', size = 'md', online }: {
  uri?: string; name?: string; size?: AvatarSize; online?: boolean
}) => {
  const dim = avatarDim[size]
  return (
    <View style={{ width: dim, height: dim }}>
      {uri
        ? <Image source={{ uri }} style={{ width: dim, height: dim, borderRadius: dim / 2 }} />
        : (
          <View style={{
            width: dim, height: dim, borderRadius: dim / 2,
            backgroundColor: Colors.surfaceModal, alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: Colors.textSecondary, fontSize: dim / 3, fontWeight: '700' }}>
              {name[0].toUpperCase()}
            </Text>
          </View>
        )
      }
      {online !== undefined && (
        <View style={{
          position: 'absolute', bottom: 0, right: 0,
          width: dim * 0.28, height: dim * 0.28,
          borderRadius: dim,
          backgroundColor: online ? Colors.success : Colors.textMuted,
          borderWidth: 2, borderColor: Colors.background,
        }} />
      )}
    </View>
  )
}

// ─── Skeleton ─────────────────────────────────
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated'
import { useEffect } from 'react'

export const Skeleton = ({ width, height, radius = Radii.md, style }: {
  width?: number | string; height: number; radius?: number; style?: ViewStyle
}) => {
  const opacity = useSharedValue(0.3)
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true)
  }, [opacity])
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }))
  return (
    <Animated.View style={[{
      backgroundColor: Colors.surfaceModal,
      borderRadius: radius,
      height,
      width: width ?? '100%',
    }, anim, style]} />
  )
}
