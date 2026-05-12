import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { MapPin, Clock, CheckCircle2 } from 'lucide-react-native'
import { Badge } from '@/components/atoms'
import { Colors, Typography, Radii, Spacing } from '@/theme/colors'
import type { Listing } from '@/types'

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60)   return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400)return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const conditionVariant = {
  new:      'success', like_new: 'primary',
  good:     'warning', fair:     'muted',
} as const

function getMetaBadge(category: string, meta?: Record<string, string | number | boolean>): string | null {
  if (!meta) return null
  switch (category) {
    case 'vehicles':   return [meta['make'], meta['year']].filter(Boolean).join(' ') || null
    case 'mobiles':    return [meta['brand'], meta['storage']].filter(Boolean).join(' · ') || null
    case 'property':   return meta['bedrooms'] ? `${meta['bedrooms']} bed` : null
    case 'electronics':return meta['brand'] ? String(meta['brand']) : null
    case 'fashion':    return [meta['gender'], meta['size']].filter(Boolean).join(' · ') || null
    case 'kids':       return meta['age_range'] ? String(meta['age_range']) : null
    case 'food':       return meta['unit'] ? `Per ${meta['unit']}` : null
    default:           return null
  }
}

interface Props {
  listing: Listing
  width?: number
  compact?: boolean
}

export const ListingCard = ({ listing, width, compact = false }: Props) => {
  const router = useRouter()

  if (compact) {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/listing/${listing.id}`)}
        activeOpacity={0.8}
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 12,
          padding: 12, borderRadius: Radii.xl,
          backgroundColor: Colors.surfaceCard,
        }}
      >
        <Image
          source={{ uri: listing.coverImage }}
          style={{ width: 60, height: 60, borderRadius: Radii.md }}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: Typography.sm, fontFamily: Typography.fontSansBold }}>
            Rwf {listing.price.toLocaleString()}
          </Text>
          <Text
            numberOfLines={1}
            style={{ color: Colors.textPrimary, fontSize: Typography.sm, fontFamily: Typography.fontSans, marginTop: 2 }}
          >
            {listing.title}
          </Text>
          <Text style={{ color: Colors.textSecondary, fontSize: Typography.xs, fontFamily: Typography.fontSans }}>
            {listing.location.neighborhood}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={() => router.push(`/listing/${listing.id}`)}
      activeOpacity={0.85}
      style={{
        width: width ?? '100%',
        borderRadius: Radii.xl,
        backgroundColor: Colors.surfaceCard,
        overflow: 'hidden',
      }}
    >
      {/* Image */}
      <View style={{ position: 'relative', aspectRatio: 4 / 3 }}>
        <Image
          source={{ uri: listing.coverImage }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        {listing.isFeatured && (
          <View style={{ position: 'absolute', top: 8, left: 8 }}>
            <Badge label="Featured" variant="primary" />
          </View>
        )}
        <View style={{ position: 'absolute', top: 8, right: 8 }}>
          <Badge label={listing.condition.replace('_', ' ')} variant={conditionVariant[listing.condition]} />
        </View>
      </View>

      {/* Info */}
      <View style={{ padding: 10, gap: 4 }}>
        <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: Typography.base, fontFamily: Typography.fontSansBold }}>
          Rwf {listing.price.toLocaleString()}
        </Text>
        {(() => {
          const badge = getMetaBadge(listing.category, listing.meta)
          return badge ? (
            <Text style={styles.metaBadge}>{badge}</Text>
          ) : null
        })()}
        <Text
          numberOfLines={1}
          style={{ color: Colors.textPrimary, fontSize: Typography.sm, fontWeight: '600', fontFamily: Typography.fontSansBold }}
        >
          {listing.title}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <MapPin size={11} color={Colors.textSecondary} />
            <Text style={{ color: Colors.textSecondary, fontSize: Typography.xs, fontFamily: Typography.fontSans }}>
              {listing.location.neighborhood}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Clock size={11} color={Colors.textSecondary} />
            <Text style={{ color: Colors.textSecondary, fontSize: Typography.xs, fontFamily: Typography.fontSans }}>
              {timeAgo(listing.postedAt)}
            </Text>
          </View>
        </View>

        {listing.seller.verificationStatus !== 'none' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <CheckCircle2 size={11} color={Colors.success} />
            <Text style={{ color: Colors.success, fontSize: Typography.xs, fontFamily: Typography.fontSans }}>Verified</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  metaBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    backgroundColor: Colors.surfaceModal,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
})
