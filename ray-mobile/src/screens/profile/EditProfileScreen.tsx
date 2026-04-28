import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import * as Haptics from 'expo-haptics'
import { Camera } from 'lucide-react-native'
import { usersApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { Colors } from '@/theme/colors'
import { KIGALI_NEIGHBORHOODS } from '@/constants/locations'

export const EditProfileScreen = () => {
  const navigation = useNavigation()
  const { user, updateUser } = useAuthStore()

  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [selectedLocation, setSelectedLocation] = useState(user?.location?.displayLabel || '')
  const [avatarUri, setAvatarUri] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri)
    }
  }

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError('Display name is required')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      let newAvatarUrl = user?.avatar

      // Upload new avatar if selected
      if (avatarUri) {
        const response = await fetch(avatarUri)
        const blob = await response.blob()
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
        const uploadResult = await usersApi.uploadAvatar(file)
        newAvatarUrl = uploadResult.url
      }

      // Find selected location object
      const locationObj = KIGALI_NEIGHBORHOODS.find(
        (n) => n.displayLabel === selectedLocation
      )

      // Update profile
      await usersApi.updateProfile({
        displayName: displayName.trim(),
        location: locationObj
          ? {
              district: locationObj.district,
              neighborhood: locationObj.name,
              displayLabel: locationObj.displayLabel,
            }
          : undefined,
        avatar: newAvatarUrl,
      })

      // Update local store
      updateUser({
        displayName: displayName.trim(),
        location: locationObj
          ? {
              district: locationObj.district,
              neighborhood: locationObj.name,
              displayLabel: locationObj.displayLabel,
            }
          : undefined,
        avatar: newAvatarUrl,
      })

      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }

      navigation.goBack()
    } catch (err) {
      setError('Failed to save profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const currentAvatar = avatarUri || user?.avatar

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {currentAvatar ? (
              <View style={styles.avatar}>
                {/* Image would go here */}
                <View style={styles.avatarPlaceholder} />
              </View>
            ) : (
              <View style={[styles.avatar, styles.avatarInitial]}>
                <Text style={styles.avatarInitialText}>
                  {displayName.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage}>
              <Camera color="#FFFFFF" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Display Name */}
        <View style={styles.fieldSection}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor={Colors.text.muted}
            maxLength={80}
          />
        </View>

        {/* Location */}
        <View style={styles.fieldSection}>
          <Text style={styles.label}>Location</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.locationChips}
          >
            {KIGALI_NEIGHBORHOODS.map((neighborhood) => (
              <TouchableOpacity
                key={neighborhood.displayLabel}
                style={[
                  styles.locationChip,
                  selectedLocation === neighborhood.displayLabel && styles.locationChipActive,
                ]}
                onPress={() => setSelectedLocation(neighborhood.displayLabel)}
              >
                <Text
                  style={[
                    styles.locationChipText,
                    selectedLocation === neighborhood.displayLabel && styles.locationChipTextActive,
                  ]}
                >
                  {neighborhood.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface.modal,
  },
  avatarInitial: {
    backgroundColor: '#E8390E20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialText: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.primary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  fieldSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface.modal,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text.primary,
  },
  locationChips: {
    gap: 8,
    paddingVertical: 4,
  },
  locationChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface.modal,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  locationChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  locationChipTextActive: {
    color: '#FFFFFF',
  },
  errorContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.danger + '20',
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    color: Colors.danger,
    textAlign: 'center',
  },
  saveButton: {
    marginHorizontal: 16,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})
