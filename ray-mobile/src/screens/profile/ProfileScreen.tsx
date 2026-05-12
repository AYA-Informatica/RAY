import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Alert, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import {
  Settings, ChevronRight, Heart, Bell, Star,
  Zap, HelpCircle, Shield, LogOut, Grid3X3,
  MapPin, RefreshCw, Navigation
} from 'lucide-react-native'
import { Colors } from '@/theme/colors'
import { STRINGS } from '@/constants'
import { useAuthStore } from '@/store/authStore'
import { useLocationStore } from '@/store/locationStore'
import { usersApi } from '@/services/api'
import type { Listing } from '@/types'

const MENU_ITEMS = [
  { label: 'My Ads',           icon: Grid3X3,    to: 'MyListings' },
  { label: 'Favourites',       icon: Heart,       to: 'Favourites' },
  { label: 'Notifications',    icon: Bell,        to: 'Notifications' },
  { label: 'Reviews & Ratings',icon: Star,        to: 'Reviews' },
  { label: 'Upgrade to Premium',icon: Zap,        to: 'Premium', highlight: true },
  { label: 'Settings',         icon: Settings,    to: 'Settings' },
  { label: 'Help & Support',   icon: HelpCircle,  to: 'Help' },
  { label: 'Safety Tips',      icon: Shield,      to: 'Safety' },
] as const

export const ProfileScreen = () => {
  const navigation          = useNavigation<any>()
  const { user, logout, updateUser }    = useAuthStore()
  const [listings, setListings] = useState<Listing[]>([])
  const { userLocation, requestGpsLocation, setManualLocation, isRequesting } = useLocationStore()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setLoading(true)
      usersApi.getByUser(user.id).then(setListings).catch(() => {})
      .finally(() => setLoading(false))
    }
  }, [user])

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ])
  }

  if (!user) {
    return (
      <View style={styles.notLoggedIn}>
        <Text style={styles.notLoggedEmoji}>👤</Text>
        <Text style={styles.notLoggedTitle}>Sign in to RAY</Text>
        <Text style={styles.notLoggedSub}>Access your listings, chats, and favourites</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Auth')}>
          <Text style={styles.loginBtnText}>Login / Register</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Profile header */}
      <View style={styles.header}>
        <View style={styles.orangeStrip} />
        <View style={styles.profileContent}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrap}>
              {user.avatar
                ? <Image source={{ uri: user.avatar }} style={styles.avatar} />
                : <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarInitial}>{user.displayName[0]?.toUpperCase()}</Text>
                  </View>}
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{user.displayName}</Text>
          <Text style={styles.phone}>{user.phone}</Text>
          {user.location && (
            <Text style={styles.location}>{user.location.displayLabel}</Text>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: 'Active Ads',   value: user.activeListings ?? listings.length },
              { label: 'Total Views',  value: '2.4k' },
              { label: 'Favourites',   value: 34 },
            ].map(({ label, value }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <View style={styles.statDivider} />}
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{value}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>

      {/* Location card */}
      <View style={styles.locationCard}>
        <View style={styles.locationCardHeader}>
          <Text style={styles.locationCardTitle}>Your Location</Text>
          <Text style={styles.locationCardSub}>Used for nearby listings</Text>
        </View>

        <View style={styles.locationCardBody}>
          {/* Current location */}
          <View style={styles.locationRow}>
            <View style={[
              styles.locationIcon,
              { backgroundColor: user?.location ? Colors.success + '20' : Colors.surfaceModal }
            ]}>
              <MapPin size={16} color={user?.location ? Colors.success : Colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationLabel}>
                {userLocation?.displayLabel ?? user?.location?.displayLabel ?? 'No location saved'}
              </Text>
              <Text style={styles.locationSub}>
                {userLocation
                  ? `Active · ${userLocation.source === 'gps' ? 'GPS' : 'Manual'}`
                  : 'Tap below to set your location'}
              </Text>
            </View>
          </View>

          {/* GPS button */}
          <TouchableOpacity
            style={styles.locationUpdateBtn}
            onPress={async () => {
              const loc = await requestGpsLocation()
              if (loc && user) {
                try {
                  await usersApi.updateProfile({
                    location: {
                      district:     'Kigali',
                      neighborhood: 'Current Location',
                      displayLabel: 'Your current location',
                      lat:          loc.lat,
                      lng:          loc.lng,
                      source:       'gps',
                    },
                  })
                  updateUser({ location: { ...loc, district: 'Kigali', neighborhood: 'Current Location' } })
                } catch { /* silent */ }
              }
            }}
            disabled={isRequesting}
          >
            {isRequesting
              ? <ActivityIndicator size="small" color={Colors.primary} />
              : <RefreshCw size={14} color={Colors.primary} />}
            <Text style={styles.locationUpdateBtnText}>
              {isRequesting ? 'Getting location...' : 'Update with GPS'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Premium banner */}
      <TouchableOpacity style={styles.premiumBanner} onPress={() => navigation.navigate('Premium')}>
        <View style={styles.premiumLeft}>
          <Text style={styles.premiumTitle}>{STRINGS.home.premiumBanner}</Text>
          <Text style={styles.premiumSub}>{STRINGS.home.premiumBenefit}</Text>
        </View>
        <TouchableOpacity style={styles.upgradeBtn}>
          <Text style={styles.upgradeBtnText}>Upgrade</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Menu */}
      <View style={styles.menu}>
        {MENU_ITEMS.map(({ label, icon: Icon, to, highlight }) => (
          <TouchableOpacity
            key={label}
            style={styles.menuRow}
            onPress={() => navigation.navigate(to as string)}
          >
            <Icon size={18} color={highlight ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.menuLabel, highlight && { color: Colors.primary }]}>
              {label}
            </Text>
            <ChevronRight size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
          <LogOut size={18} color={Colors.danger} />
          <Text style={[styles.menuLabel, { color: Colors.danger, flex: 1 }]}>
            {STRINGS.nav.profile === 'Profile' ? 'Logout' : STRINGS.nav.profile}
          </Text>
          <ChevronRight size={16} color={Colors.danger + '60'} />
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  notLoggedIn:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32, backgroundColor: Colors.background },
  notLoggedEmoji: { fontSize: 56 },
  notLoggedTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  notLoggedSub:   { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
  loginBtn:       { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16, marginTop: 8 },
  loginBtnText:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  header:         { backgroundColor: Colors.surfaceCard },
  orangeStrip:    { height: 80, backgroundColor: Colors.primary },
  profileContent: { padding: 16, gap: 4, marginTop: -30 },
  avatarRow:      { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 },
  avatarWrap:     {},
  avatar:         { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: Colors.surfaceCard },
  avatarFallback: { backgroundColor: Colors.primary + '30', alignItems: 'center', justifyContent: 'center' },
  avatarInitial:  { color: Colors.primary, fontSize: 32, fontWeight: '800' },
  editBtn:        { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  editBtnText:    { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  name:           { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  phone:          { color: Colors.textSecondary, fontSize: 13 },
  location:       { color: Colors.textSecondary, fontSize: 13 },
  statsRow:       { flexDirection: 'row', marginTop: 16, backgroundColor: Colors.surfaceModal, borderRadius: 16, overflow: 'hidden' },
  statItem:       { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statDivider:    { width: 1, backgroundColor: Colors.border },
  statValue:      { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
  statLabel:      { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  locationCard:   { margin: 16, backgroundColor: Colors.surfaceCard, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  locationCardHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  locationCardTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  locationCardSub:  { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  locationCardBody: { padding: 16 },
  locationRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  locationIcon:   { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  locationLabel:  { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  locationSub:    { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  locationUpdateBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, backgroundColor: Colors.surfaceModal, borderRadius: 12 },
  locationUpdateBtnText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  premiumBanner:  { flexDirection: 'row', alignItems: 'center', gap: 12, margin: 16, padding: 16, backgroundColor: Colors.navy, borderRadius: 18 },
  premiumLeft:    { flex: 1 },
  premiumTitle:   { color: '#fff', fontSize: 14, fontWeight: '700' },
  premiumSub:     { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  upgradeBtn:     { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.primary, borderRadius: 10 },
  upgradeBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  menu:           { marginHorizontal: 16, backgroundColor: Colors.surfaceCard, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  menuRow:        { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuLabel:      { flex: 1, color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
})
