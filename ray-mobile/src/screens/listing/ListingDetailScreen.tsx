import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Share, Dimensions, ActivityIndicator,
} from 'react-native'
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native'
import { MapPin, Clock, Share2, Heart, ChevronLeft, ShieldCheck, Flag } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/theme/colors'
import { STRINGS } from '@/constants'
import { listingsApi, chatApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import type { Listing } from '@/types'

const { width } = Dimensions.get('window')

type RouteParams = { ListingDetail: { listingId: string } }

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export const ListingDetailScreen = () => {
  const route      = useRoute<RouteProp<RouteParams, 'ListingDetail'>>()
  const navigation = useNavigation<any>()
  const { user }   = useAuthStore()

  const [listing, setListing]   = useState<Listing | null>(null)
  const [loading, setLoading]   = useState(true)
  const [imgIndex, setImgIndex] = useState(0)
  const [saved, setSaved]       = useState(false)
  const [chatting, setChatting] = useState(false)

  useEffect(() => {
    listingsApi.getById(route.params.listingId)
      .then(setListing)
      .finally(() => setLoading(false))
  }, [route.params.listingId])

  const handleSave = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSaved((v) => !v)
  }, [])

  const handleShare = useCallback(async () => {
    if (!listing) return
    await Share.share({
      message: `${listing.title} — ${STRINGS.currency.format(listing.price)}\nhttps://ray.rw/listing/${listing.id}`,
    })
  }, [listing])

  const handleChat = useCallback(async () => {
    if (!user) { navigation.navigate('Auth'); return }
    if (!listing) return
    setChatting(true)
    try {
      const convo = await chatApi.startConversation(listing.id)
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      navigation.navigate('ChatDetail', { conversationId: convo.id })
    } finally {
      setChatting(false)
    }
  }, [user, listing, navigation])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    )
  }

  if (!listing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.notFound}>Listing not found</Text>
      </View>
    )
  }

  const images = listing.images.length > 0 ? listing.images : [listing.coverImage]

  return (
    <View style={styles.container}>
      {/* Back button floating */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <ChevronLeft size={20} color={Colors.textPrimary} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image carousel */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            setImgIndex(Math.round(e.nativeEvent.contentOffset.x / width))
          }}
        >
          {images.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={styles.image} resizeMode="cover" />
          ))}
        </ScrollView>

        {/* Dot indicators */}
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === imgIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}

        <View style={styles.body}>
          {/* Price + actions */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{STRINGS.currency.format(listing.price)}</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.iconBtn} onPress={handleSave}>
                <Heart
                  size={20}
                  color={saved ? Colors.primary : Colors.textSecondary}
                  fill={saved ? Colors.primary : 'transparent'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                <Share2 size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {listing.negotiable && (
            <Text style={styles.negotiable}>{STRINGS.listing.negotiable}</Text>
          )}

          <Text style={styles.title}>{listing.title}</Text>

          {/* Condition + time */}
          <View style={styles.metaRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {STRINGS.listing.condition[listing.condition as keyof typeof STRINGS.listing.condition]}
              </Text>
            </View>
            {listing.isFeatured && (
              <View style={[styles.badge, styles.featuredBadge]}>
                <Text style={[styles.badgeText, { color: '#fff' }]}>{STRINGS.listing.featured}</Text>
              </View>
            )}
          </View>

          {/* Location + time */}
          <View style={styles.infoRow}>
            <MapPin size={14} color={Colors.primary} />
            <Text style={styles.infoText}>{listing.location.displayLabel}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{timeAgo(listing.postedAt)}</Text>
          </View>

          {/* Description */}
          {listing.description && (
            <>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </>
          )}

          {/* Details */}
          {listing.meta && Object.keys(listing.meta).length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Details</Text>
              <View style={styles.detailsGrid}>
                {Object.entries(listing.meta).map(([key, value]) => {
                  if (value === undefined || value === null || value === '') return null
                  // Convert key from snake_case to Title Case for display
                  const label = key
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase())
                  const displayValue =
                    typeof value === 'boolean'
                      ? value ? 'Yes' : 'No'
                      : String(value)
                  return (
                    <View key={key} style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{label}</Text>
                      <Text style={styles.detailValue}>{displayValue}</Text>
                    </View>
                  )
                })}
              </View>
            </View>
          )}

          {/* Seller card */}
          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerInitial}>
                {listing.seller.displayName[0]?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{listing.seller.displayName}</Text>
              <Text style={styles.sellerMeta}>Member since 2023 · 95% response rate</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('SellerProfile', { userId: listing.seller.id })}
            >
              <Text style={styles.viewProfile}>{STRINGS.listing.viewProfile}</Text>
            </TouchableOpacity>
          </View>

          {/* Safety tip */}
          <View style={styles.safetyBanner}>
            <ShieldCheck size={16} color={Colors.warning} />
            <Text style={styles.safetyText}>{STRINGS.listing.safetyTip}</Text>
          </View>

          {/* Report link */}
          <TouchableOpacity style={styles.reportRow}>
            <Flag size={14} color={Colors.textMuted} />
            <Text style={styles.reportText}>Report this listing</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.stickyBar}>
        <TouchableOpacity
          style={[styles.chatBtn, listing.status === 'sold' && styles.chatBtnDisabled]}
          onPress={handleChat}
          disabled={chatting || listing.status === 'sold'}
        >
          {chatting
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.chatBtnText}>
                {listing.status === 'sold' ? 'Item Sold' : STRINGS.listing.chatWithSeller}
              </Text>}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.background },
  loadingContainer:{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  notFound:        { color: Colors.textSecondary, fontSize: 16 },
  backBtn:         { position: 'absolute', top: 50, left: 16, zIndex: 10, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  image:           { width, height: 300 },
  dots:            { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: -20, marginBottom: 8 },
  dot:             { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive:       { backgroundColor: '#fff', width: 14 },
  body:            { paddingHorizontal: 16, paddingTop: 16 },
  priceRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  price:           { fontSize: 28, fontWeight: '800', color: Colors.primary },
  actions:         { flexDirection: 'row', gap: 8 },
  iconBtn:         { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center' },
  negotiable:      { color: Colors.textSecondary, fontSize: 12, marginBottom: 6 },
  title:           { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 10, lineHeight: 24 },
  metaRow:         { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badge:           { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: Colors.surfaceModal, borderWidth: 1, borderColor: Colors.border },
  badgeText:       { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
  featuredBadge:   { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  infoRow:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  infoText:        { color: Colors.textSecondary, fontSize: 13 },
  sectionTitle:    { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  description:     { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },
  detailsGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  detailItem:      { width: '48%', backgroundColor: Colors.surfaceModal, borderRadius: 12, padding: 10 },
  detailLabel:     { color: Colors.textMuted, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  detailValue:     { color: Colors.textPrimary, fontSize: 12, fontWeight: '600' },
  sellerCard:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: Colors.surfaceCard, borderRadius: 16, marginTop: 20, borderWidth: 1, borderColor: Colors.border },
  sellerAvatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + '30', alignItems: 'center', justifyContent: 'center' },
  sellerInitial:   { color: Colors.primary, fontSize: 18, fontWeight: '700' },
  sellerInfo:      { flex: 1 },
  sellerName:      { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  sellerMeta:      { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  viewProfile:     { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  safetyBanner:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, backgroundColor: Colors.warning + '15', borderRadius: 14, marginTop: 16, borderWidth: 1, borderColor: Colors.warning + '30' },
  safetyText:      { flex: 1, color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  reportRow:       { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 20, paddingVertical: 8 },
  reportText:      { color: Colors.textMuted, fontSize: 12 },
  stickyBar:       { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, backgroundColor: Colors.surfaceCard, borderTopWidth: 1, borderTopColor: Colors.border },
  chatBtn:         { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  chatBtnDisabled: { opacity: 0.5 },
  chatBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
})
